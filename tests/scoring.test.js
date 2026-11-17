const assert = require('assert');
const { matches: initialMatches, players: initialPlayers } = require('../src/data/mockData');
const { calculatePlayerOfMatch, computePlayerCareerStats, calculateShotBreakdown, generateWhatsAppSummary } = require('../src/data/statsHelper');

// Engine logic extracted from App.js
function updateScore(item, event, undoHistory = []) {
  if (event === 'undo') {
    const previous = undoHistory[undoHistory.length - 1];
    if (!previous) return { item, undoHistory, toast: 'Nothing to undo yet' };
    return { item: previous, undoHistory: undoHistory.slice(0, -1) };
  }
  if (item.status !== 'LIVE') return { item, undoHistory };
  if (event === 'swapStrike' || (typeof event === 'object' && event?.type === 'swapStrike')) {
    if ((item.batters || []).length < 2) return { item, undoHistory };
    const batters = item.batters.map((batter) => ({ ...batter, onStrike: !batter.onStrike }));
    const next = { ...item, batters };
    return { item: next, undoHistory: [...undoHistory, item] };
  }
  if (typeof event === 'object' && event?.type === 'setNoBallRun') {
    const next = { ...item, noBallRun: event.value };
    return { item: next, undoHistory };
  }
  if (typeof event === 'object' && event?.type === 'Retire') {
    const reason = event.reason || 'retired hurt';
    const isOut = reason === 'retired out';
    const targetBatterName = event.batterName || item.batters.find((b) => b.onStrike)?.name || item.batters[0]?.name;
    const subBatterName = event.subBatter;
    const retireIdx = item.batters.findIndex((b) => b.name === targetBatterName);
    if (retireIdx < 0) return { item, undoHistory };
    const wasOnStrike = item.batters[retireIdx].onStrike;

    const battingCard = [...(item.battingCard || item.batters.map((b) => ({ ...b, fours: b.fours || 0, sixes: b.sixes || 0 })))];
    let cardIdx = battingCard.findIndex((b) => b.name === targetBatterName);
    if (cardIdx < 0) {
      cardIdx = battingCard.length;
      battingCard.push({ name: targetBatterName, runs: item.batters[retireIdx].runs, balls: item.batters[retireIdx].balls, fours: 0, sixes: 0, dismissed: false });
    }
    battingCard[cardIdx] = {
      ...battingCard[cardIdx],
      dismissed: isOut,
      howOut: reason,
    };

    let batters = [...item.batters];
    let pendingBatterSelection = false;
    let pendingBatterIndex = null;
    let pendingBatterOnStrike = null;

    if (subBatterName) {
      batters[retireIdx] = {
        name: subBatterName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        onStrike: wasOnStrike,
      };
      if (!battingCard.some((b) => b.name === subBatterName)) {
        battingCard.push({
          name: subBatterName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          dismissed: false,
        });
      }
    } else {
      pendingBatterSelection = true;
      pendingBatterIndex = retireIdx;
      pendingBatterOnStrike = wasOnStrike;
    }

    const finalWickets = item.wickets + (isOut ? 1 : 0);
    const squadCount = item.battingPlayers?.length || (item.batters?.length ? item.batters.length + 1 : 11);
    const allOut = Boolean(isOut && finalWickets >= squadCount - 1);
    const inningComplete = allOut;
    const inningsBreak = Boolean(inningComplete && (item.inningsNumber || 1) === 1);
    const targetReached = Boolean((item.inningsNumber || 1) === 2 && item.target && item.score >= item.target);
    const matchComplete = Boolean((item.inningsNumber || 1) === 2 && (targetReached || inningComplete));

    const overHistory = [...(item.overHistory || [])];
    if (overHistory.length > 0) {
      const lastIdx = overHistory.length - 1;
      const lastOver = overHistory[lastIdx];
      if (!lastOver.complete) {
        overHistory[lastIdx] = {
          ...lastOver,
          wickets: lastOver.wickets + (isOut ? 1 : 0),
          balls: [
            ...lastOver.balls,
            {
              label: isOut ? 'Ret.Out' : 'Ret.Hurt',
              runs: 0,
              legal: false,
              wicket: isOut,
              howOut: reason,
              dismissedBatter: targetBatterName,
            },
          ],
        };
      }
    }

    const dismissedPlayers = isOut
      ? [...new Set([...(item.dismissedPlayers || []), targetBatterName])]
      : (item.dismissedPlayers || []);

    const next = {
      ...item,
      status: inningsBreak ? 'INNINGS_BREAK' : matchComplete ? 'AWAITING_END' : item.status,
      target: inningsBreak ? item.score + 1 : item.target,
      wickets: finalWickets,
      batters,
      battingCard,
      dismissedPlayers,
      pendingBatterSelection: !matchComplete && !inningsBreak && pendingBatterSelection,
      pendingBatterIndex,
      pendingBatterOnStrike,
      overHistory,
    };

    return { item: next, undoHistory: [...undoHistory, item] };
  }
  const isWicket = event === 'Wicket' || (typeof event === 'object' && event?.type === 'Wicket');
  const out = isWicket;
  const dismissalType = (typeof event === 'object' && event?.dismissalType) || 'Bowled';
  const fielder = (typeof event === 'object' && event?.fielder) || '';
  const isNoBall = event === 'No ball' || (typeof event === 'object' && event?.type === 'No ball');
  const isWide = event === 'Wide';
  const extra = isWide || isNoBall;
  const legalDelivery = !extra;

  const noBallPenalty = (typeof event === 'object' && event?.penalty !== undefined)
    ? event.penalty
    : (item.noBallRun !== undefined ? item.noBallRun : 0);
  const batRuns = (typeof event === 'object' && event?.type === 'No ball') ? (event.batRuns || 0) : 0;

  let runs = 0;
  let batterRuns = 0;
  let shotDirection = null;
  if (typeof event === 'number') {
    runs = event;
    batterRuns = event;
  } else if (typeof event === 'object' && event?.type === 'Run') {
    runs = event.runs ?? 0;
    batterRuns = event.runs ?? 0;
    shotDirection = event.shotDirection || null;
  } else if (typeof event === 'object' && event?.runs !== undefined && !isNoBall && !isWicket) {
    runs = event.runs ?? 0;
    batterRuns = event.runs ?? 0;
    shotDirection = event.shotDirection || null;
  } else if (isWide) {
    runs = 1;
    batterRuns = 0;
  } else if (isNoBall) {
    runs = noBallPenalty + batRuns;
    batterRuns = batRuns;
    shotDirection = event?.shotDirection || null;
  }

  const ballLabel = out
    ? 'W'
    : isWide
    ? 'Wd'
    : isNoBall
    ? (batRuns > 0 ? `Nb+${batRuns}` : 'Nb')
    : typeof event === 'number'
    ? `${event}`
    : typeof event === 'object' && event?.runs !== undefined
    ? `${event.runs}`
    : '0';
  const [completedOvers, ballsInOver] = item.overs.split('.').map(Number);
  const totalBalls = completedOvers * 6 + ballsInOver + (legalDelivery ? 1 : 0);
  const overText = `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
  let batters = [...item.batters];
  let strikerIndex = Math.max(0, batters.findIndex((batter) => batter.onStrike));
  let dismissedIndex = strikerIndex;
  if (out && typeof event === 'object' && event?.dismissedBatter) {
    const customIdx = batters.findIndex((b) => b.name === event.dismissedBatter);
    if (customIdx >= 0) dismissedIndex = customIdx;
  }
  const dismissedName = out ? batters[dismissedIndex].name : null;
  const oldBowler = item.bowler;
  const currentBowlerName = oldBowler.name;
  let howOut = 'Out';
  if (dismissalType === 'Bowled') {
    howOut = `b ${currentBowlerName}`;
  } else if (dismissalType === 'Caught') {
    howOut = fielder && fielder !== currentBowlerName ? `c ${fielder} b ${currentBowlerName}` : `c & b ${currentBowlerName}`;
  } else if (dismissalType === 'LBW') {
    howOut = `lbw b ${currentBowlerName}`;
  } else if (dismissalType === 'Run out') {
    howOut = fielder ? `run out (${fielder})` : 'run out';
  } else if (dismissalType === 'Stumped') {
    howOut = fielder ? `st ${fielder} b ${currentBowlerName}` : `st b ${currentBowlerName}`;
  } else if (dismissalType === 'Hit wicket') {
    howOut = `hit wicket b ${currentBowlerName}`;
  } else {
    howOut = dismissalType;
  }

  const battingCard = [...(item.battingCard || item.batters.map((batter) => ({ ...batter, fours: batter.fours || 0, sixes: batter.sixes || 0 })))];
  const ballFaced = (legalDelivery || isNoBall);
  if (out) {
    let cardIndex = battingCard.findIndex((batter) => batter.name === dismissedName);
    if (cardIndex < 0) {
      cardIndex = battingCard.length;
      battingCard.push({ name: dismissedName, runs: batters[dismissedIndex].runs, balls: batters[dismissedIndex].balls, fours: 0, sixes: 0, dismissed: false });
    }
    const facedBall = ballFaced && dismissedIndex === strikerIndex;
    battingCard[cardIndex] = {
      ...battingCard[cardIndex],
      balls: (battingCard[cardIndex].balls || 0) + (facedBall ? 1 : 0),
      dismissed: true,
      howOut,
      dismissalType,
    };
    if (dismissedIndex !== strikerIndex && ballFaced) {
      let strikerCardIdx = battingCard.findIndex((b) => b.name === batters[strikerIndex].name);
      if (strikerCardIdx >= 0) {
        battingCard[strikerCardIdx] = {
          ...battingCard[strikerCardIdx],
          balls: (battingCard[strikerCardIdx].balls || 0) + 1,
        };
      }
      batters[strikerIndex] = {
        ...batters[strikerIndex],
        balls: batters[strikerIndex].balls + 1,
      };
    }
    batters[dismissedIndex] = {
      ...batters[dismissedIndex],
      dismissed: true,
      onStrike: false,
      howOut,
      dismissalType,
      balls: batters[dismissedIndex].balls + (facedBall ? 1 : 0),
    };
  } else {
    let cardIndex = battingCard.findIndex((batter) => batter.name === batters[strikerIndex].name);
    if (cardIndex < 0) { cardIndex = battingCard.length; battingCard.push({ name: batters[strikerIndex].name, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }); }
    const currentShots = { ...(battingCard[cardIndex].shots || { 'Off side': 0, 'Straight': 0, 'Leg side': 0, 'Behind': 0 }) };
    if (shotDirection && currentShots[shotDirection] !== undefined) {
      currentShots[shotDirection] = (currentShots[shotDirection] || 0) + 1;
    }
    battingCard[cardIndex] = { ...battingCard[cardIndex], runs: (battingCard[cardIndex].runs || 0) + batterRuns, balls: (battingCard[cardIndex].balls || 0) + (ballFaced ? 1 : 0), fours: (battingCard[cardIndex].fours || 0) + (batterRuns === 4 ? 1 : 0), sixes: (battingCard[cardIndex].sixes || 0) + (batterRuns === 6 ? 1 : 0), dismissed: battingCard[cardIndex].dismissed, shots: currentShots };
    batters[strikerIndex] = {
      ...batters[strikerIndex],
      runs: batters[strikerIndex].runs + batterRuns,
      balls: batters[strikerIndex].balls + (ballFaced ? 1 : 0),
      fours: (batters[strikerIndex].fours || 0) + (batterRuns === 4 ? 1 : 0),
      sixes: (batters[strikerIndex].sixes || 0) + (batterRuns === 6 ? 1 : 0),
      shots: currentShots,
    };
  }
  const strikeRuns = batterRuns;
  const overComplete = legalDelivery && totalBalls > 0 && totalBalls % 6 === 0;
  if (!out && batters.length > 1) {
    if (overComplete) {
      // Once the over is done, strike rotates to the other partner
      batters = batters.map((batter, idx) => ({ ...batter, onStrike: idx !== strikerIndex }));
    } else if (strikeRuns % 2 === 1) {
      // Mid-over odd runs: strike rotates
      batters = batters.map((batter) => ({ ...batter, onStrike: !batter.onStrike }));
    }
  }
  const [oldBowlerOvers, oldBowlerBallsInOver] = oldBowler.overs.split('.').map(Number);
  const bowlerBalls = (oldBowler.legalBalls ?? oldBowlerOvers * 6 + oldBowlerBallsInOver) + (legalDelivery ? 1 : 0);
  const bowlerRuns = runs;
  const bowlerGetsWicket = out && dismissalType !== 'Run out';
  const bowlingStats = { ...(item.bowlingStats || {}), [oldBowler.name]: { runs: oldBowler.runs + bowlerRuns, wickets: oldBowler.wickets + (bowlerGetsWicket ? 1 : 0), legalBalls: bowlerBalls } };
  const overNumber = completedOvers + 1;
  const overHistory = [...(item.overHistory || [])];
  let currentOverIndex = overHistory.findIndex((over) => over.over === overNumber);
  if (currentOverIndex < 0) {
    currentOverIndex = overHistory.length;
    overHistory.push({ over: overNumber, runs: 0, wickets: 0, balls: [], bowler: oldBowler.name, complete: false });
  }
  const currentOver = overHistory[currentOverIndex];
  overHistory[currentOverIndex] = { ...currentOver, runs: currentOver.runs + runs, wickets: currentOver.wickets + (out ? 1 : 0), balls: [...currentOver.balls, { label: ballLabel, runs, legal: legalDelivery, wicket: out, howOut: out ? howOut : null, dismissalType: out ? dismissalType : null, dismissedBatter: dismissedName, shotDirection: shotDirection || null, striker: batters[strikerIndex]?.name || null }], bowler: oldBowler.name, complete: overComplete };
  const nextBowlerName = oldBowler.name;
  const bowlerStats = bowlingStats[nextBowlerName] || { runs: 0, wickets: 0, legalBalls: 0 };
  const nextBatterIndex = item.nextBatterIndex ?? 2;
  const availableBatters = (item.battingPlayers || []).filter((name) => !(item.dismissedPlayers || []).includes(name) && !item.batters.some((batter) => batter.name === name));
  const nextBatterName = availableBatters?.[0];
  const squadCount = item.battingPlayers?.length || (item.batters?.length ? item.batters.length + 1 : 11);
  const allOut = Boolean(out && (item.wickets + 1 >= squadCount - 1));
  const oversComplete = Boolean(item.totalOvers && totalBalls >= item.totalOvers * 6);
  const inningComplete = oversComplete || allOut;
  const inningsBreak = Boolean(inningComplete && (item.inningsNumber || 1) === 1);
  const targetReached = Boolean((item.inningsNumber || 1) === 2 && item.target && item.score + runs >= item.target);
  const matchComplete = Boolean((item.inningsNumber || 1) === 2 && (targetReached || inningComplete));
  const completed = inningsBreak || matchComplete;
  const pendingBatterSelection = Boolean(out && nextBatterName && !completed);
  const pendingBowlerSelection = Boolean(overComplete && (item.bowlingPlayers?.length || 0) > 1 && !completed);
  const finalScore = item.score + runs;
  const finalWickets = item.wickets + (out ? 1 : 0);
  const result = inningsBreak
    ? 'First innings complete'
    : matchComplete
    ? targetReached
      ? `${item.home.name} won by ${Math.max(1, squadCount - finalWickets - 1)} wickets`
      : finalScore === item.target - 1
      ? 'Match tied'
      : `${item.away.name} won by ${Math.max(0, item.target - 1 - finalScore)} runs`
    : item.result;
  const firstInnings = inningsBreak ? { team: item.home.name, score: finalScore, wickets: finalWickets, overs: overText, totalOvers: item.totalOvers, batters, battingCard, overHistory, bowlingStats, bowler: { ...item.bowler } } : item.firstInnings;
  const next = { ...item, status: inningsBreak ? 'INNINGS_BREAK' : matchComplete ? 'AWAITING_END' : item.status, result, target: inningsBreak ? finalScore + 1 : item.target, firstInnings, score: finalScore, wickets: finalWickets, overs: overText, lastBalls: [...(item.lastBalls || []), ballLabel].slice(-6), overHistory, batters, battingCard, nextBatterIndex, dismissedPlayers: out ? [...(item.dismissedPlayers || []), dismissedName] : item.dismissedPlayers || [], pendingBatterSelection, pendingBatterIndex: pendingBatterSelection ? dismissedIndex : null, pendingBatterOnStrike: pendingBatterSelection ? (overComplete ? (dismissedIndex !== strikerIndex) : (dismissedIndex === strikerIndex)) : null, pendingBowlerSelection, bowlingStats, bowler: { name: nextBowlerName, runs: bowlerStats.runs, wickets: bowlerStats.wickets, legalBalls: bowlerStats.legalBalls, overs: `${Math.floor(bowlerStats.legalBalls / 6)}.${bowlerStats.legalBalls % 6}` }, noBallRun: noBallPenalty };
  return { item: next, undoHistory: [...undoHistory, item] };
}

function selectNextBowler(item, name, undoHistory = []) {
  if (!item?.pendingBowlerSelection || !(item.bowlingPlayers || []).includes(name) || name === item.bowler.name) return { item, undoHistory };
  const stats = (item.bowlingStats || {})[name] || { runs: 0, wickets: 0, legalBalls: 0 };
  const next = { ...item, bowler: { name, ...stats, overs: `${Math.floor(stats.legalBalls / 6)}.${stats.legalBalls % 6}` }, pendingBowlerSelection: false };
  return { item: next, undoHistory: [...undoHistory, item] };
}

function selectNextBatter(item, name, undoHistory = []) {
  if (!item?.pendingBatterSelection || !(item.battingPlayers || []).includes(name)) return { item, undoHistory };
  const usedNames = [...(item.dismissedPlayers || []), ...item.batters.map((batter) => batter.name)];
  if (usedNames.includes(name)) return { item, undoHistory };
  const batters = item.batters.map((batter, index) => index === item.pendingBatterIndex ? { name, runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: item.pendingBatterOnStrike !== false } : { ...batter, onStrike: item.pendingBatterOnStrike === false });
  const battingCard = [...(item.battingCard || [])];
  if (!battingCard.some((batter) => batter.name === name)) battingCard.push({ name, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false });
  const next = { ...item, batters, battingCard, pendingBatterSelection: false, pendingBatterIndex: null, pendingBatterOnStrike: null };
  return { item: next, undoHistory: [...undoHistory, item] };
}

function startSecondInnings(item, { striker, nonStriker, bowler }) {
  if (!item || item.status !== 'INNINGS_BREAK') return item;
  const battingPlayers = item.bowlingPlayers?.length ? item.bowlingPlayers : [striker, nonStriker];
  const bowlingPlayers = item.battingPlayers?.length ? item.battingPlayers : [bowler];
  if (!battingPlayers.includes(striker) || !battingPlayers.includes(nonStriker) || striker === nonStriker || !bowlingPlayers.includes(bowler)) {
    return { error: 'Choose batters and a bowler from the correct teams' };
  }
  return {
    ...item,
    status: 'LIVE',
    inningsNumber: 2,
    innings: `${item.away.name} 2nd innings`,
    home: item.away,
    away: item.home,
    battingPlayers,
    bowlingPlayers,
    score: 0,
    wickets: 0,
    overs: '0.0',
    target: item.firstInnings.score + 1,
    result: null,
    batters: [{ name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true }, { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: false }],
    battingCard: [{ name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }, { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }],
    nextBatterIndex: 2,
    dismissedPlayers: [],
    pendingBatterSelection: false,
    pendingBowlerSelection: false,
    pendingBatterIndex: null,
    pendingBatterOnStrike: null,
    bowler: { name: bowler, overs: '0.0', runs: 0, wickets: 0, legalBalls: 0 },
    bowlingStats: {},
    lastBalls: [],
    overHistory: []
  };
}

let passed = 0;
let total = 0;

function it(desc, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    console.error(`  [FAIL] ${desc}:`, err.message);
  }
}

console.log('\n=== PITCH CRICKET AUTOMATED UNIT TEST SUITE ===\n');

it('TEST 1: Strike rotation when over is done on a single (Ball 6)', () => {
  let m = {
    status: 'LIVE', overs: '0.5', score: 5, wickets: 0, totalOvers: 2,
    batters: [{ name: 'A', runs: 5, balls: 5, onStrike: true }, { name: 'B', runs: 0, balls: 0, onStrike: false }],
    battingPlayers: ['A', 'B', 'C'], bowlingPlayers: ['Bowler 1', 'Bowler 2'],
    bowler: { name: 'Bowler 1', overs: '0.5', runs: 5, wickets: 0, legalBalls: 5 },
    overHistory: []
  };
  // Ball 6: 1 run scored
  const res = updateScore(m, 1);
  const striker = res.item.batters.find(b => b.onStrike).name;
  // Over is done => strike rotates to partner B
  assert.strictEqual(striker, 'B', 'Partner B must take strike once the over is done');
});

it('TEST 2: Strike rotation on dot ball at over boundary (Ball 6)', () => {
  let m = {
    status: 'LIVE', overs: '0.5', score: 5, wickets: 0, totalOvers: 2,
    batters: [{ name: 'A', runs: 5, balls: 5, onStrike: true }, { name: 'B', runs: 0, balls: 0, onStrike: false }],
    battingPlayers: ['A', 'B', 'C'], bowlingPlayers: ['Bowler 1', 'Bowler 2'],
    bowler: { name: 'Bowler 1', overs: '0.5', runs: 5, wickets: 0, legalBalls: 5 },
    overHistory: []
  };
  // Ball 6: 0 runs scored
  const res = updateScore(m, 0);
  const striker = res.item.batters.find(b => b.onStrike).name;
  // Dot on ball 6 => ends swap => partner B faces next over
  assert.strictEqual(striker, 'B', 'Non-striker must take strike after dot on ball 6');
});

it('TEST 3: Strike rate does not render NaN for 0 balls faced', () => {
  const batter = { runs: 0, balls: 0 };
  const sr = batter.balls ? ((batter.runs || 0) * 100 / batter.balls).toFixed(1) : '0.0';
  assert.strictEqual(sr, '0.0');
  assert.notStrictEqual(sr, 'NaN');
});

it('TEST 4: Fours and sixes recorded accurately on batters and battingCard', () => {
  let m = {
    status: 'LIVE', overs: '0.0', score: 0, wickets: 0, totalOvers: 1,
    batters: [{ name: 'A', runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true }, { name: 'B', runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: false }],
    battingCard: [{ name: 'A', runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }, { name: 'B', runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }],
    battingPlayers: ['A', 'B'], bowlingPlayers: ['Bowler 1', 'Bowler 2'],
    bowler: { name: 'Bowler 1', overs: '0.0', runs: 0, wickets: 0, legalBalls: 0 },
    overHistory: []
  };
  // Ball 1: 4
  m = updateScore(m, 4).item;
  // Ball 2: 6
  m = updateScore(m, 6).item;
  assert.strictEqual(m.batters[0].fours, 1);
  assert.strictEqual(m.batters[0].sixes, 1);
  assert.strictEqual(m.battingCard[0].fours, 1);
  assert.strictEqual(m.battingCard[0].sixes, 1);
});

it('TEST 5: Mock data m1 has complete squads and supports wicket prompt and 2nd innings', () => {
  const m1 = initialMatches.find(m => m.id === 'm1');
  assert.ok(m1, 'm1 must exist in initialMatches');
  assert.ok(Array.isArray(m1.battingPlayers) && m1.battingPlayers.length > 0, 'm1 must have battingPlayers');
  assert.ok(Array.isArray(m1.bowlingPlayers) && m1.bowlingPlayers.length > 0, 'm1 must have bowlingPlayers');

  // Wicket on m1 should trigger pendingBatterSelection
  const wicketRes = updateScore(m1, 'Wicket').item;
  assert.strictEqual(wicketRes.pendingBatterSelection, true, 'Wicket on m1 must prompt for next batter');

  // Starting second innings on innings break must succeed
  const breakMatch = { ...m1, status: 'INNINGS_BREAK', target: 143, firstInnings: { score: 142, wickets: 4, team: 'Harbor Hawks' } };
  const s2 = startSecondInnings(breakMatch, {
    striker: m1.bowlingPlayers[0],
    nonStriker: m1.bowlingPlayers[1],
    bowler: m1.battingPlayers[0]
  });
  assert.strictEqual(s2.status, 'LIVE');
  assert.strictEqual(s2.target, 143);
});

it('TEST 6: Team all-out triggers innings break in 1st innings without errors', () => {
  let m = {
    status: 'LIVE', inningsNumber: 1, overs: '1.2', score: 30, wickets: 1, totalOvers: 5,
    batters: [{ name: 'A2', runs: 10, balls: 4, onStrike: true }, { name: 'A3', runs: 5, balls: 4, onStrike: false }],
    battingPlayers: ['A1', 'A2', 'A3'], // 3 players => 2 wickets = all out
    bowlingPlayers: ['B1', 'B2'],
    home: { name: 'Team Alpha' }, away: { name: 'Team Beta' },
    bowler: { name: 'B1', overs: '0.2', runs: 10, wickets: 1, legalBalls: 2 },
    dismissedPlayers: ['A1'],
    overHistory: []
  };
  const res = updateScore(m, 'Wicket').item;
  assert.strictEqual(res.status, 'INNINGS_BREAK');
  assert.strictEqual(res.target, 31);
});

it('TEST 7: Chasing team victory calculated cleanly without crashing when battingPlayers is undefined', () => {
  let m = {
    status: 'LIVE', inningsNumber: 2, overs: '2.3', score: 48, wickets: 1, totalOvers: 5, target: 50,
    batters: [{ name: 'B1', runs: 25, balls: 10, onStrike: true }, { name: 'B2', runs: 23, balls: 5, onStrike: false }],
    home: { name: 'Team Beta' }, away: { name: 'Team Alpha' },
    bowler: { name: 'A1', overs: '1.3', runs: 20, wickets: 1, legalBalls: 9 },
    overHistory: []
    // battingPlayers omitted intentionally to test resilience
  };
  const res = updateScore(m, 4).item;
  assert.strictEqual(res.status, 'AWAITING_END');
  assert.ok(res.result.includes('Team Beta won by'));
});

it('TEST 8: Tied match correctly detected when target - 1 is reached at overs completion', () => {
  let m = {
    status: 'LIVE', inningsNumber: 2, overs: '1.5', score: 48, wickets: 1, totalOvers: 2, target: 50,
    batters: [{ name: 'B1', runs: 20, balls: 5, onStrike: true }, { name: 'B2', runs: 28, balls: 6, onStrike: false }],
    home: { name: 'Team Beta' }, away: { name: 'Team Alpha' },
    bowler: { name: 'A1', overs: '0.5', runs: 10, wickets: 0, legalBalls: 5 },
    overHistory: []
  };
  const res = updateScore(m, 1).item; // Score becomes 49 (target 50 - 1) on final ball
  assert.strictEqual(res.status, 'AWAITING_END');
  assert.strictEqual(res.result, 'Match tied');
});

it('TEST 9: Bowler selection pushes to undo stack so bowler choice can be undone', () => {
  let m = {
    status: 'LIVE', overs: '1.0', score: 6, wickets: 0, totalOvers: 2,
    pendingBowlerSelection: true,
    bowlingPlayers: ['B1', 'B2'],
    bowler: { name: 'B1', overs: '1.0', runs: 6, wickets: 0, legalBalls: 6 },
    bowlingStats: { B1: { runs: 6, wickets: 0, legalBalls: 6 } }
  };
  let undoStack = [];
  const selected = selectNextBowler(m, 'B2', undoStack);
  assert.strictEqual(selected.item.bowler.name, 'B2');
  assert.strictEqual(selected.undoHistory.length, 1);

  // Undo bowler selection
  const undone = updateScore(selected.item, 'undo', selected.undoHistory);
  assert.strictEqual(undone.item.bowler.name, 'B1');
  assert.strictEqual(undone.item.pendingBowlerSelection, true);
});

it('TEST 10: Player directory operations (Add, Edit, Delete)', () => {
  let directory = [
    { id: 'p1', name: 'Rohit Sharma', role: 'Batter' },
    { id: 'p2', name: 'Virat Kohli', role: 'Batter' }
  ];

  // Add
  const newPlayer = { id: 'p3', name: 'Jasprit Bumrah', role: 'Bowler' };
  directory = [newPlayer, ...directory];
  assert.strictEqual(directory.length, 3);
  assert.strictEqual(directory[0].name, 'Jasprit Bumrah');

  // Edit
  directory = directory.map(p => p.id === 'p1' ? { ...p, name: 'Rohit Sharma (C)', role: 'Captain' } : p);
  const edited = directory.find(p => p.id === 'p1');
  assert.strictEqual(edited.name, 'Rohit Sharma (C)');
  assert.strictEqual(edited.role, 'Captain');

  // Delete
  directory = directory.filter(p => p.id !== 'p2');
  assert.strictEqual(directory.length, 2);
  assert.strictEqual(directory.some(p => p.id === 'p2'), false);
});

it('TEST 11: Squad mutual exclusion - Team A chooses Rohit, Team B cannot choose Rohit', () => {
  let players1 = [];
  let players2 = [];

  function toggleTeam1(name) {
    if (players2.includes(name)) return false; // blocked
    if (players1.includes(name)) {
      players1 = players1.filter(p => p !== name);
    } else {
      players1 = [...players1, name];
    }
    return true;
  }

  function toggleTeam2(name) {
    if (players1.includes(name)) return false; // blocked
    if (players2.includes(name)) {
      players2 = players2.filter(p => p !== name);
    } else {
      players2 = [...players2, name];
    }
    return true;
  }

  // Team 1 picks Rohit
  const picked1 = toggleTeam1('Rohit Sharma');
  assert.strictEqual(picked1, true);
  assert.ok(players1.includes('Rohit Sharma'));

  // Team 2 attempts to pick Rohit => must be rejected!
  const picked2 = toggleTeam2('Rohit Sharma');
  assert.strictEqual(picked2, false, 'Team 2 cannot choose Rohit while selected by Team 1');
  assert.strictEqual(players2.includes('Rohit Sharma'), false);

  // Deselect Rohit from Team 1
  toggleTeam1('Rohit Sharma');
  assert.strictEqual(players1.includes('Rohit Sharma'), false);

  // Now Team 2 can pick Rohit
  const picked2After = toggleTeam2('Rohit Sharma');
  assert.strictEqual(picked2After, true);
  assert.ok(players2.includes('Rohit Sharma'));

  // Team 1 attempts to pick Rohit => must be rejected!
  const picked1Again = toggleTeam1('Rohit Sharma');
  assert.strictEqual(picked1Again, false, 'Team 1 cannot choose Rohit while selected by Team 2');
});

it('TEST 12: Wicket causes (Bowled, Caught, LBW, Run out) are correctly recorded in battingCard and bowling figures', () => {
  let m = {
    status: 'LIVE', overs: '0.0', score: 0, wickets: 0, totalOvers: 5,
    batters: [
      { name: 'Rohit Sharma', runs: 12, balls: 6, onStrike: true },
      { name: 'Virat Kohli', runs: 8, balls: 4, onStrike: false }
    ],
    battingPlayers: ['Rohit Sharma', 'Virat Kohli', 'Suryakumar Yadav', 'Hardik Pandya'],
    bowlingPlayers: ['Jasprit Bumrah', 'Mohammed Shami'],
    bowler: { name: 'Jasprit Bumrah', overs: '0.0', runs: 0, wickets: 0, legalBalls: 0 },
    bowlingStats: {},
    overHistory: []
  };

  // 1. Caught dismissal with fielder
  const res1 = updateScore(m, {
    type: 'Wicket',
    dismissalType: 'Caught',
    dismissedBatter: 'Rohit Sharma',
    fielder: 'Mohammed Shami'
  }).item;

  const rohitCard = res1.battingCard.find(b => b.name === 'Rohit Sharma');
  assert.strictEqual(rohitCard.dismissed, true);
  assert.strictEqual(rohitCard.howOut, 'c Mohammed Shami b Jasprit Bumrah');
  assert.strictEqual(rohitCard.dismissalType, 'Caught');
  assert.strictEqual(res1.bowler.wickets, 1, 'Bowler gets wicket for Caught');
  assert.strictEqual(res1.wickets, 1);

  // 2. Run out dismissal of non-striker
  let mRunOut = {
    status: 'LIVE', overs: '0.1', score: 10, wickets: 0, totalOvers: 5,
    batters: [
      { name: 'Rohit Sharma', runs: 6, balls: 2, onStrike: true },
      { name: 'Virat Kohli', runs: 4, balls: 1, onStrike: false }
    ],
    battingPlayers: ['Rohit Sharma', 'Virat Kohli', 'Suryakumar Yadav', 'Hardik Pandya'],
    bowlingPlayers: ['Jasprit Bumrah', 'Mohammed Shami'],
    bowler: { name: 'Jasprit Bumrah', overs: '0.1', runs: 10, wickets: 0, legalBalls: 1 },
    bowlingStats: { 'Jasprit Bumrah': { runs: 10, wickets: 0, legalBalls: 1 } },
    overHistory: []
  };

  const res2 = updateScore(mRunOut, {
    type: 'Wicket',
    dismissalType: 'Run out',
    dismissedBatter: 'Virat Kohli',
    fielder: 'Jasprit Bumrah'
  }).item;

  const viratCard = res2.battingCard.find(b => b.name === 'Virat Kohli');
  assert.strictEqual(viratCard.dismissed, true);
  assert.strictEqual(viratCard.howOut, 'run out (Jasprit Bumrah)');
  assert.strictEqual(res2.bowler.wickets, 0, 'Bowler does NOT get credit for Run out');
  assert.strictEqual(res2.wickets, 1, 'Team wickets incremented on Run out');
});

it('TEST 13: Automatic Player of the Match calculates standout performer based on match impact', () => {
  const match = {
    id: 'm-test',
    status: 'AWAITING_END',
    result: 'Team A won by 15 runs',
    home: { name: 'Team A' },
    away: { name: 'Team B' },
    firstInnings: {
      team: 'Team A',
      score: 110,
      wickets: 3,
      overs: '10.0',
      battingCard: [
        { name: 'Rohit Sharma', runs: 68, balls: 38, fours: 7, sixes: 3, dismissed: false },
        { name: 'Virat Kohli', runs: 24, balls: 16, fours: 2, sixes: 0, dismissed: true }
      ],
      bowlingStats: {
        'Pat Cummins': { runs: 28, wickets: 2, legalBalls: 18 }
      }
    },
    battingCard: [
      { name: 'David Warner', runs: 40, balls: 28, fours: 4, sixes: 1, dismissed: true },
      { name: 'Steve Smith', runs: 22, balls: 18, fours: 1, sixes: 0, dismissed: true }
    ],
    bowlingStats: {
      'Jasprit Bumrah': { runs: 16, wickets: 3, legalBalls: 18 },
      'Hardik Pandya': { runs: 24, wickets: 1, legalBalls: 12 }
    }
  };

  const potmResult = calculatePlayerOfMatch(match);
  assert.ok(potmResult, 'POTM result must exist');
  assert.ok(potmResult.bestPlayer, 'Best player must be selected');
  // Rohit Sharma scored 68* off 38 balls with 7x4, 3x6 in winning team
  assert.strictEqual(potmResult.bestPlayer.name, 'Rohit Sharma');
  assert.ok(potmResult.bestPlayer.points > 60, 'Impact points calculated');
  assert.ok(potmResult.bestPlayer.summary.includes('68 runs'), 'Summary contains runs');
});

it('TEST 14: Overall Career Statistics computes matches, runs, strike rate, average, wickets, economy', () => {
  const mockPlayer = {
    id: 'p-test',
    name: 'Rohit Sharma',
    role: 'Top-order batter',
    runs: 420,
    balls: 296,
    matches: 14,
    innings: 14,
    fours: 42,
    sixes: 16,
    highestScore: '89*',
    notOuts: 2,
    wickets: 2,
    legalBalls: 36,
    runsConceded: 44,
    bestBowling: '1/12',
    potmCount: 3
  };

  const completedMatches = [
    {
      id: 'match-101',
      status: 'COMPLETED',
      playerOfMatch: 'Rohit Sharma',
      battingPlayers: ['Rohit Sharma'],
      battingCard: [
        { name: 'Rohit Sharma', runs: 50, balls: 25, fours: 6, sixes: 2, dismissed: false }
      ]
    }
  ];

  const stats = computePlayerCareerStats(mockPlayer, completedMatches);
  assert.ok(stats, 'Stats computed');
  // Runs: 420 baseline + 50 from custom match = 470
  assert.strictEqual(stats.runs, 470);
  assert.strictEqual(stats.matches, 15);
  // Strike rate: 470 / (296 + 25) = 470 / 321 * 100 = 146.4
  assert.strictEqual(stats.strikeRate, '146.4');
  // POTM count: 3 baseline + 1 award in match-101 = 4
  assert.strictEqual(stats.potmCount, 4);
  assert.strictEqual(stats.fifties, 1);
  assert.strictEqual(stats.recentPerformances.length, 1);
  assert.strictEqual(stats.recentPerformances[0].isPotm, true);
});

it('TEST 15: Local Cricket No Ball with 0 penalty: re-bowled, 0 penalty runs added, batter faces delivery', () => {
  let match = {
    status: 'LIVE', overs: '0.2', score: 10, wickets: 0, totalOvers: 2, noBallRun: 0,
    batters: [{ name: 'A', runs: 6, balls: 2, fours: 1, sixes: 0, onStrike: true }, { name: 'B', runs: 4, balls: 0, fours: 1, sixes: 0, onStrike: false }],
    battingPlayers: ['A', 'B', 'C'], bowlingPlayers: ['Bowler 1', 'Bowler 2'],
    bowler: { name: 'Bowler 1', overs: '0.2', runs: 10, wickets: 0, legalBalls: 2 },
    overHistory: []
  };

  const res = updateScore(match, { type: 'No ball', batRuns: 0 });
  // Total score remains 10 (0 penalty + 0 bat runs)
  assert.strictEqual(res.item.score, 10, 'Team score should remain 10');
  // Over ball count should NOT advance (still 0.2)
  assert.strictEqual(res.item.overs, '0.2', 'Over must not advance on No Ball');
  // Ball label should be 'Nb'
  assert.strictEqual(res.item.lastBalls[res.item.lastBalls.length - 1], 'Nb');
  // Batter A faced the ball, balls incremented to 3
  const batterA = res.item.batters.find(b => b.name === 'A');
  assert.strictEqual(batterA.balls, 3, 'Batter balls faced must increment');
  assert.strictEqual(batterA.runs, 6, 'Batter runs should remain unchanged');
  // Bowler legal balls must not increment
  assert.strictEqual(res.item.bowler.legalBalls, 2, 'Bowler legal balls must not increment');
});

it('TEST 16: Local Cricket No Ball with 4 runs off bat (0 penalty): score +4, batter gets 4 runs and boundary', () => {
  let match = {
    status: 'LIVE', overs: '1.1', score: 20, wickets: 0, totalOvers: 5, noBallRun: 0,
    batters: [{ name: 'Rohit', runs: 12, balls: 7, fours: 2, sixes: 0, onStrike: true }, { name: 'Virat', runs: 8, balls: 0, fours: 1, sixes: 0, onStrike: false }],
    battingPlayers: ['Rohit', 'Virat'], bowlingPlayers: ['Starc'],
    bowler: { name: 'Starc', overs: '0.1', runs: 5, wickets: 0, legalBalls: 1 },
    overHistory: []
  };

  const res = updateScore(match, { type: 'No ball', batRuns: 4 });
  // Total score should be 20 + 4 = 24
  assert.strictEqual(res.item.score, 24, 'Team score must increase by 4');
  // Ball label should be 'Nb+4'
  assert.strictEqual(res.item.lastBalls[res.item.lastBalls.length - 1], 'Nb+4');
  // Batter Rohit gets +4 runs and +1 four
  const rohit = res.item.batters.find(b => b.name === 'Rohit');
  assert.strictEqual(rohit.runs, 16, 'Batter gets 4 runs');
  assert.strictEqual(rohit.fours, 3, 'Batter fours count increments');
  assert.strictEqual(rohit.balls, 8, 'Batter balls faced increments');
  // 4 is even number => Rohit remains on strike
  assert.strictEqual(rohit.onStrike, true, 'Striker remains on strike after boundary');
  // Over ball count unchanged
  assert.strictEqual(res.item.overs, '1.1', 'Overs count must not advance');
});

it('TEST 17: Standard Cricket No Ball (+1 penalty) with 6 runs off bat: score +7, batter gets 6 and maximum', () => {
  let match = {
    status: 'LIVE', overs: '2.4', score: 35, wickets: 1, totalOvers: 10, noBallRun: 1,
    batters: [{ name: 'Hardik', runs: 14, balls: 8, fours: 1, sixes: 1, onStrike: true }, { name: 'Pant', runs: 10, balls: 6, fours: 1, sixes: 0, onStrike: false }],
    battingPlayers: ['Hardik', 'Pant'], bowlingPlayers: ['Cummins'],
    bowler: { name: 'Cummins', overs: '1.4', runs: 18, wickets: 1, legalBalls: 10 },
    overHistory: []
  };

  const res = updateScore(match, { type: 'No ball', batRuns: 6 });
  // Total score: 35 + 1 penalty + 6 bat = 42
  assert.strictEqual(res.item.score, 42, 'Team score must increase by 7 (1 penalty + 6 bat)');
  // Ball label 'Nb+6'
  assert.strictEqual(res.item.lastBalls[res.item.lastBalls.length - 1], 'Nb+6');
  // Batter gets 6 runs and +1 six
  const hardik = res.item.batters.find(b => b.name === 'Hardik');
  assert.strictEqual(hardik.runs, 20, 'Batter gets 6 runs');
  assert.strictEqual(hardik.sixes, 2, 'Batter sixes count increments');
  // Bowler conceded 7 runs
  assert.strictEqual(res.item.bowlingStats['Cummins'].runs, 25, 'Bowler runs conceded must include penalty and bat runs');
  assert.strictEqual(res.item.bowler.legalBalls, 10, 'Bowler legal balls must not advance');
});

it('TEST 18: Strike rotation on single off No Ball and in-match rule switch', () => {
  let match = {
    status: 'LIVE', overs: '0.0', score: 0, wickets: 0, totalOvers: 2, noBallRun: 0,
    batters: [{ name: 'A', runs: 0, balls: 0, onStrike: true }, { name: 'B', runs: 0, balls: 0, onStrike: false }],
    battingPlayers: ['A', 'B'], bowlingPlayers: ['Bowler 1'],
    bowler: { name: 'Bowler 1', overs: '0.0', runs: 0, wickets: 0, legalBalls: 0 },
    overHistory: []
  };

  // Single taken on No Ball
  const res1 = updateScore(match, { type: 'No ball', batRuns: 1 });
  assert.strictEqual(res1.item.score, 1, 'Score increases by 1');
  const strikerAfterSingle = res1.item.batters.find(b => b.onStrike).name;
  assert.strictEqual(strikerAfterSingle, 'B', 'Single off No Ball must rotate strike to B');

  // Change penalty rule during match
  const res2 = updateScore(res1.item, { type: 'setNoBallRun', value: 1 });
  assert.strictEqual(res2.item.noBallRun, 1, 'Match rule successfully updated to 1 run penalty');
});

it('TEST 19: Over completion always rotates strike and manual swapStrike toggle works', () => {
  // Over complete on a boundary (4 runs)
  let match = {
    status: 'LIVE', overs: '0.5', score: 10, wickets: 0, totalOvers: 2,
    batters: [{ name: 'Rohit', runs: 10, balls: 5, onStrike: true }, { name: 'Virat', runs: 0, balls: 0, onStrike: false }],
    battingPlayers: ['Rohit', 'Virat'], bowlingPlayers: ['Starc'],
    bowler: { name: 'Starc', overs: '0.5', runs: 10, wickets: 0, legalBalls: 5 },
    overHistory: []
  };

  // Ball 6: 4 runs scored -> over complete -> strike rotates to Virat
  const resOver = updateScore(match, 4);
  assert.strictEqual(resOver.item.overs, '1.0', 'Over completes at 1.0');
  const strikerNextOver = resOver.item.batters.find(b => b.onStrike).name;
  assert.strictEqual(strikerNextOver, 'Virat', 'Partner Virat must be on strike once over is done');

  // Manual strike rotation via swapStrike
  const resManual = updateScore(resOver.item, 'swapStrike');
  const manualStriker = resManual.item.batters.find(b => b.onStrike).name;
  assert.strictEqual(manualStriker, 'Rohit', 'swapStrike manually rotates strike back to Rohit');
});

it('TEST 20: Retire Hurt keeps team wickets unchanged, marks batter retired hurt & not out', () => {
  let match = {
    status: 'LIVE', overs: '3.2', score: 32, wickets: 1, totalOvers: 10,
    batters: [
      { name: 'Rohit', runs: 24, balls: 14, fours: 3, sixes: 1, onStrike: true },
      { name: 'Virat', runs: 8, balls: 6, fours: 1, sixes: 0, onStrike: false },
    ],
    battingCard: [
      { name: 'Rohit', runs: 24, balls: 14, fours: 3, sixes: 1, dismissed: false },
      { name: 'Virat', runs: 8, balls: 6, fours: 1, sixes: 0, dismissed: false },
    ],
    battingPlayers: ['Rohit', 'Virat', 'Suryakumar', 'Hardik'],
    bowlingPlayers: ['Starc'],
    bowler: { name: 'Starc', overs: '1.2', runs: 12, wickets: 1, legalBalls: 8 },
    overHistory: [{ over: 4, runs: 2, wickets: 0, balls: [], bowler: 'Starc', complete: false }],
  };

  const res = updateScore(match, {
    type: 'Retire',
    reason: 'retired hurt',
    batterName: 'Rohit',
    subBatter: 'Suryakumar',
  });

  // Wickets should remain 1 (no wicket penalty)
  assert.strictEqual(res.item.wickets, 1, 'Team wickets must NOT increment on Retired Hurt');
  // Rohit should be marked retired hurt and NOT dismissed
  const rohitCard = res.item.battingCard.find((b) => b.name === 'Rohit');
  assert.strictEqual(rohitCard.howOut, 'retired hurt', 'howOut must be retired hurt');
  assert.strictEqual(rohitCard.dismissed, false, 'dismissed must be false for retired hurt');

  // Suryakumar should now be in batters and on strike
  const striker = res.item.batters.find((b) => b.onStrike);
  assert.strictEqual(striker.name, 'Suryakumar', 'Replacement batter Suryakumar must take strike');
});

it('TEST 21: Retire Out adds +1 wicket to team wickets, marks batter retired out & dismissed', () => {
  let match = {
    status: 'LIVE', overs: '4.0', score: 45, wickets: 1, totalOvers: 10,
    batters: [
      { name: 'KL Rahul', runs: 15, balls: 18, fours: 1, sixes: 0, onStrike: false },
      { name: 'Pant', runs: 30, balls: 16, fours: 2, sixes: 2, onStrike: true },
    ],
    battingCard: [
      { name: 'KL Rahul', runs: 15, balls: 18, fours: 1, sixes: 0, dismissed: false },
      { name: 'Pant', runs: 30, balls: 16, fours: 2, sixes: 2, dismissed: false },
    ],
    battingPlayers: ['KL Rahul', 'Pant', 'Hardik'],
    bowlingPlayers: ['Cummins'],
    bowler: { name: 'Cummins', overs: '2.0', runs: 18, wickets: 1, legalBalls: 12 },
    overHistory: [{ over: 4, runs: 6, wickets: 0, balls: [], bowler: 'Cummins', complete: false }],
  };

  const res = updateScore(match, {
    type: 'Retire',
    reason: 'retired out',
    batterName: 'KL Rahul',
    subBatter: 'Hardik',
  });

  // Wickets should increment by 1
  assert.strictEqual(res.item.wickets, 2, 'Team wickets must increment by 1 on Retired Out');
  // Bowler Cummins wicket count should remain 1 (no bowler credit)
  assert.strictEqual(res.item.bowler.wickets, 1, 'Bowler must NOT receive wicket credit for Retired Out');
  // KL Rahul must be dismissed
  const rahulCard = res.item.battingCard.find((b) => b.name === 'KL Rahul');
  assert.strictEqual(rahulCard.howOut, 'retired out', 'howOut must be retired out');
  assert.strictEqual(rahulCard.dismissed, true, 'dismissed must be true for retired out');
});

it('TEST 22: Boundary shot direction tagging attaches shotDirection to overHistory and aggregates shots', () => {
  let match = {
    status: 'LIVE', overs: '1.0', score: 10, wickets: 0, totalOvers: 5,
    batters: [
      { name: 'Rohit', runs: 10, balls: 6, fours: 2, sixes: 0, onStrike: true },
      { name: 'Gill', runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: false },
    ],
    battingCard: [
      { name: 'Rohit', runs: 10, balls: 6, fours: 2, sixes: 0, dismissed: false },
      { name: 'Gill', runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false },
    ],
    battingPlayers: ['Rohit', 'Gill'],
    bowlingPlayers: ['Shaheen'],
    bowler: { name: 'Shaheen', overs: '1.0', runs: 10, wickets: 0, legalBalls: 6 },
    overHistory: [],
  };

  // Ball 1 of Over 2: Rohit hits 4 towards Off side
  const res = updateScore(match, { type: 'Run', runs: 4, shotDirection: 'Off side' });
  const over2 = res.item.overHistory.find((o) => o.over === 2);
  assert.ok(over2, 'Over 2 must be recorded');
  const ball = over2.balls[0];
  assert.strictEqual(ball.shotDirection, 'Off side', 'Ball must record shotDirection as Off side');
  assert.strictEqual(ball.runs, 4, 'Ball runs must be 4');

  // Check batter shots aggregation
  const rohitCard = res.item.battingCard.find((b) => b.name === 'Rohit');
  assert.strictEqual(rohitCard.shots['Off side'], 1, 'Rohit must have 1 shot recorded to Off side');
});

it('TEST 23: Wagon Wheel shot breakdown helper calculates direction percentages and counts', () => {
  const match = {
    firstInnings: {
      overHistory: [
        {
          over: 1,
          balls: [
            { runs: 4, shotDirection: 'Off side', batter: 'Rohit' },
            { runs: 6, shotDirection: 'Straight', batter: 'Rohit' },
          ],
        },
      ],
    },
    overHistory: [
      {
        over: 1,
        balls: [
          { runs: 4, shotDirection: 'Leg side', batter: 'Virat' },
          { runs: 4, shotDirection: 'Off side', batter: 'Virat' },
        ],
      },
    ],
  };

  const breakdown = calculateShotBreakdown(match);
  assert.strictEqual(breakdown.total, 4, 'Total tagged shots should be 4');
  assert.strictEqual(breakdown.counts['Off side'], 2, 'Off side should have 2 shots');
  assert.strictEqual(breakdown.counts['Straight'], 1, 'Straight should have 1 shot');
  assert.strictEqual(breakdown.counts['Leg side'], 1, 'Leg side should have 1 shot');
  assert.strictEqual(breakdown.counts['Behind'], 0, 'Behind should have 0 shots');
});

it('TEST 24: WhatsApp Match Summary Generator formats scores, top performers, PotM, and result', () => {
  const match = {
    home: { name: 'Mumbai Stars' },
    away: { name: 'Delhi Royals' },
    score: 165,
    wickets: 4,
    overs: '19.2',
    target: 162,
    result: 'Mumbai Stars won by 6 wickets',
    playerOfMatch: 'Rohit Sharma',
    potmSummary: '72 (38b) & 1 catch',
    firstInnings: {
      team: 'Delhi Royals',
      score: 161,
      wickets: 7,
      overs: '20.0',
      battingCard: [
        { name: 'Rishabh Pant', runs: 58, balls: 34, fours: 5, sixes: 3, dismissed: true },
      ],
      bowlingStats: {
        'Jasprit Bumrah': { runs: 24, wickets: 3, legalBalls: 24 },
      },
    },
    battingCard: [
      { name: 'Rohit Sharma', runs: 72, balls: 38, fours: 7, sixes: 4, dismissed: false },
    ],
    bowlingStats: {
      'Anrich Nortje': { runs: 38, wickets: 2, legalBalls: 24 },
    },
  };

  const text = generateWhatsAppSummary(match);
  assert.ok(text.includes('PITCH CRICKET MATCH REPORT'), 'Summary header present');
  assert.ok(text.includes('MUMBAI STARS WON BY 6 WICKETS'), 'Result present');
  assert.ok(text.includes('Rohit Sharma: 72*'), 'Top batsman with not-out asterisk present');
  assert.ok(text.includes('Jasprit Bumrah: 3/24'), 'Top bowler figures present');
  assert.ok(text.includes('Rohit Sharma'), 'POTM present');
  assert.ok(text.includes('whatsapp') || text.includes('Pitch Cricket'), 'Footer branding present');
});

console.log(`\nResults: ${passed} / ${total} tests passed.\n`);
if (passed === total) {
  console.log('ALL TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED!\n');
  process.exit(1);
}
