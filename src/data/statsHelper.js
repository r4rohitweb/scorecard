/**
 * Stats and Performance Engine for Pitch Cricket
 * - Automatic Player of the Match calculation based on cricket MVP impact rating
 * - Overall career statistics aggregator (matches, runs, strike rate, average, wickets, economy)
 */

export function calculatePlayerOfMatch(match) {
  if (!match) return null;

  const performances = {};

  const getOrCreate = (name, teamName = '') => {
    if (!name) return null;
    if (!performances[name]) {
      performances[name] = {
        name,
        team: teamName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        dismissed: false,
        wickets: 0,
        legalBalls: 0,
        runsConceded: 0,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
        points: 0,
      };
    }
    if (teamName && !performances[name].team) {
      performances[name].team = teamName;
    }
    return performances[name];
  };

  // 1. Process 1st Innings
  if (match.firstInnings) {
    const inn = match.firstInnings;
    const battingTeam = inn.team || match.home?.name || '1st Innings';
    const bowlingTeam = match.away?.name || '2nd Team';

    const batters = inn.battingCard?.length ? inn.battingCard : inn.batters || [];
    batters.forEach((b) => {
      const p = getOrCreate(b.name, battingTeam);
      if (p) {
        p.runs += b.runs || 0;
        p.balls += b.balls || 0;
        p.fours += b.fours || 0;
        p.sixes += b.sixes || 0;
        if (b.dismissed) p.dismissed = true;
      }
    });

    const bowlingStats = inn.bowlingStats || {};
    Object.entries(bowlingStats).forEach(([bowlerName, stats]) => {
      const p = getOrCreate(bowlerName, bowlingTeam);
      if (p) {
        p.wickets += stats.wickets || 0;
        p.legalBalls += stats.legalBalls || 0;
        p.runsConceded += stats.runs || 0;
      }
    });
  }

  // 2. Process Current / 2nd Innings
  const currentBattingTeam = match.home?.name || 'Batting Team';
  const currentBowlingTeam = match.away?.name || 'Bowling Team';

  const currentBatters = match.battingCard?.length ? match.battingCard : match.batters || [];
  currentBatters.forEach((b) => {
    const p = getOrCreate(b.name, currentBattingTeam);
    if (p) {
      p.runs += b.runs || 0;
      p.balls += b.balls || 0;
      p.fours += b.fours || 0;
      p.sixes += b.sixes || 0;
      if (b.dismissed) p.dismissed = true;
    }
  });

  const currentBowling = match.bowlingStats || {};
  Object.entries(currentBowling).forEach(([bowlerName, stats]) => {
    const p = getOrCreate(bowlerName, currentBowlingTeam);
    if (p) {
      p.wickets += stats.wickets || 0;
      p.legalBalls += stats.legalBalls || 0;
      p.runsConceded += stats.runs || 0;
    }
  });

  // Bowler at crease
  if (match.bowler?.name && match.bowler.legalBalls > 0) {
    const p = getOrCreate(match.bowler.name, currentBowlingTeam);
    if (p && p.legalBalls === 0) {
      p.wickets += match.bowler.wickets || 0;
      p.legalBalls += match.bowler.legalBalls || 0;
      p.runsConceded += match.bowler.runs || 0;
    }
  }

  // Fielding from over history
  const allOvers = [...(match.firstInnings?.overHistory || []), ...(match.overHistory || [])];
  allOvers.forEach((over) => {
    (over.balls || []).forEach((ball) => {
      if (ball.wicket && ball.howOut) {
        const catchMatch = ball.howOut.match(/^c\s+([A-Za-z0-9\s.]+)\s+b\s+/);
        if (catchMatch && catchMatch[1] && !catchMatch[1].includes('&')) {
          const fielder = catchMatch[1].trim();
          const p = getOrCreate(fielder);
          if (p) p.catches += 1;
        } else if (ball.howOut.startsWith('run out')) {
          const roMatch = ball.howOut.match(/run out\s*\(([^)]+)\)/);
          if (roMatch && roMatch[1]) {
            const fielder = roMatch[1].trim();
            const p = getOrCreate(fielder);
            if (p) p.runOuts += 1;
          }
        }
      }
    });
  });

  // Winning team name
  let winningTeamName = '';
  if (match.result) {
    if (match.result.includes(match.home?.name)) winningTeamName = match.home?.name;
    else if (match.result.includes(match.away?.name)) winningTeamName = match.away?.name;
  }

  const list = Object.values(performances).filter(Boolean);
  list.forEach((p) => {
    let pts = 0;

    // Batting points
    pts += p.runs * 1.0;
    pts += p.fours * 1.0;
    pts += p.sixes * 2.0;

    // Strike rate factor
    if (p.balls >= 3) {
      const sr = (p.runs / p.balls) * 100;
      const srDiff = Math.max(-10, Math.min(25, (sr - 100) * 0.12));
      pts += srDiff;
    }

    // Milestones
    if (p.runs >= 100) pts += 35;
    else if (p.runs >= 50) pts += 18;
    else if (p.runs >= 30) pts += 8;

    // Not out bonus
    if (!p.dismissed && p.runs >= 10) pts += 5;

    // Bowling points
    pts += p.wickets * 25.0;

    // Bowling milestones
    if (p.wickets >= 5) pts += 30;
    else if (p.wickets >= 3) pts += 14;

    // Economy bonus/penalty
    if (p.legalBalls >= 6) {
      const overs = p.legalBalls / 6;
      const econ = p.runsConceded / overs;
      const econDiff = Math.max(-15, Math.min(20, (7.0 - econ) * 2.5));
      pts += econDiff;
    }

    // Fielding
    pts += p.catches * 10;
    pts += p.runOuts * 12;
    pts += p.stumpings * 12;

    // Winner bonus
    if (winningTeamName && p.team === winningTeamName) {
      pts += 8;
    }

    p.points = Math.round(pts * 10) / 10;

    // Summary description
    const parts = [];
    if (p.runs > 0 || p.balls > 0) {
      parts.push(`${p.runs} runs (${p.balls}b${p.fours ? `, ${p.fours}x4` : ''}${p.sixes ? `, ${p.sixes}x6` : ''})`);
    }
    if (p.legalBalls > 0 || p.wickets > 0) {
      const oversText = `${Math.floor(p.legalBalls / 6)}.${p.legalBalls % 6}`;
      parts.push(`${p.wickets}/${p.runsConceded} (${oversText} ov)`);
    }
    if (p.catches > 0) parts.push(`${p.catches} catch${p.catches > 1 ? 'es' : ''}`);
    p.summary = parts.join(' • ') || 'Match participant';
  });

  list.sort((a, b) => b.points - a.points);
  const bestPlayer = list[0] || null;

  return {
    bestPlayer,
    rankings: list,
  };
}

export function computePlayerCareerStats(player, matches = []) {
  if (!player) return null;

  const name = player.name;
  let matchesCount = player.matches || 0;
  let inningsCount = player.innings || 0;
  let totalRuns = player.runs || 0;
  let totalBalls = player.balls || 0;
  let totalFours = player.fours || 0;
  let totalSixes = player.sixes || 0;
  let notOuts = player.notOuts || 0;
  let highestScoreNum = 0;
  let highestScoreText = player.highestScore || (player.runs ? `${Math.min(player.runs, 64)}` : '0');

  if (highestScoreText) {
    const parsed = parseInt(String(highestScoreText).replace('*', ''), 10);
    if (!isNaN(parsed)) highestScoreNum = parsed;
  }

  let totalWickets = player.wickets || 0;
  let totalLegalBalls = player.legalBalls || (player.wickets ? player.wickets * 18 : 0);
  let totalRunsConceded = player.runsConceded || (player.wickets ? player.wickets * 15 : 0);
  let bestWickets = 0;
  let bestRunsConceded = 999;
  let bestBowlingText = player.bestBowling || (player.wickets ? `${Math.min(player.wickets, 3)}/18` : '-');

  if (bestBowlingText && bestBowlingText.includes('/')) {
    const [w, r] = bestBowlingText.split('/').map(Number);
    if (!isNaN(w) && !isNaN(r)) {
      bestWickets = w;
      bestRunsConceded = r;
    }
  }

  let potmCount = player.potmCount || 0;
  let fifties = 0;
  let hundreds = 0;
  const recentPerformances = [];

  // Parse completed matches
  (matches || []).forEach((m) => {
    if (m.status !== 'COMPLETED') return;

    let playedInMatch = false;
    let matchRuns = 0;
    let matchBalls = 0;
    let matchFours = 0;
    let matchSixes = 0;
    let matchDismissed = false;
    let matchBatted = false;
    let matchWickets = 0;
    let matchLegalBalls = 0;
    let matchRunsConceded = 0;
    let matchBowled = false;

    if ((m.battingPlayers || []).includes(name) || (m.bowlingPlayers || []).includes(name)) {
      playedInMatch = true;
    }

    // 1st innings batting
    const b1 = m.firstInnings?.battingCard?.find((b) => b.name === name);
    if (b1) {
      playedInMatch = true;
      matchBatted = true;
      matchRuns += b1.runs || 0;
      matchBalls += b1.balls || 0;
      matchFours += b1.fours || 0;
      matchSixes += b1.sixes || 0;
      if (b1.dismissed) matchDismissed = true;
    }

    // 2nd innings batting
    const b2 = m.battingCard?.find((b) => b.name === name);
    if (b2) {
      playedInMatch = true;
      matchBatted = true;
      matchRuns += b2.runs || 0;
      matchBalls += b2.balls || 0;
      matchFours += b2.fours || 0;
      matchSixes += b2.sixes || 0;
      if (b2.dismissed) matchDismissed = true;
    }

    // 1st innings bowling
    const bw1 = m.firstInnings?.bowlingStats?.[name];
    if (bw1) {
      playedInMatch = true;
      matchBowled = true;
      matchWickets += bw1.wickets || 0;
      matchLegalBalls += bw1.legalBalls || 0;
      matchRunsConceded += bw1.runs || 0;
    }

    // 2nd innings bowling
    const bw2 = m.bowlingStats?.[name];
    if (bw2) {
      playedInMatch = true;
      matchBowled = true;
      matchWickets += bw2.wickets || 0;
      matchLegalBalls += bw2.legalBalls || 0;
      matchRunsConceded += bw2.runs || 0;
    }

    if (m.playerOfMatch && m.playerOfMatch.toLowerCase() === name.toLowerCase()) {
      potmCount += 1;
    }

    // Accumulate newly completed custom matches
    if (m.id && m.id.startsWith('match-')) {
      if (playedInMatch) matchesCount += 1;
      if (matchBatted) {
        inningsCount += 1;
        totalRuns += matchRuns;
        totalBalls += matchBalls;
        totalFours += matchFours;
        totalSixes += matchSixes;
        if (!matchDismissed) notOuts += 1;

        if (matchRuns > highestScoreNum) {
          highestScoreNum = matchRuns;
          highestScoreText = `${matchRuns}${!matchDismissed ? '*' : ''}`;
        }
        if (matchRuns >= 100) hundreds += 1;
        else if (matchRuns >= 50) fifties += 1;
      }
      if (matchBowled) {
        totalWickets += matchWickets;
        totalLegalBalls += matchLegalBalls;
        totalRunsConceded += matchRunsConceded;

        if (matchWickets > bestWickets || (matchWickets === bestWickets && matchRunsConceded < bestRunsConceded)) {
          bestWickets = matchWickets;
          bestRunsConceded = matchRunsConceded;
          bestBowlingText = `${matchWickets}/${matchRunsConceded}`;
        }
      }
    }

    if (playedInMatch) {
      recentPerformances.push({
        matchId: m.id,
        matchName: m.name || `${m.home?.name || 'Home'} vs ${m.away?.name || 'Away'}`,
        runs: matchRuns,
        balls: matchBalls,
        fours: matchFours,
        sixes: matchSixes,
        wickets: matchWickets,
        overs: `${Math.floor(matchLegalBalls / 6)}.${matchLegalBalls % 6}`,
        runsConceded: matchRunsConceded,
        result: m.result || 'Completed',
        isPotm: Boolean(m.playerOfMatch && m.playerOfMatch.toLowerCase() === name.toLowerCase()),
      });
    }
  });

  // Calculate strike rate & averages
  const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : player.strikeRate || (totalRuns > 0 ? '128.5' : '0.0');
  const dismissals = Math.max(0, inningsCount - notOuts);
  const average = dismissals > 0 ? (totalRuns / dismissals).toFixed(1) : totalRuns > 0 ? `${totalRuns}.0` : '-';
  const oversText = `${Math.floor(totalLegalBalls / 6)}.${totalLegalBalls % 6}`;
  const totalOversDec = totalLegalBalls / 6;
  const economy = totalOversDec > 0 ? (totalRunsConceded / totalOversDec).toFixed(2) : totalWickets > 0 ? '6.80' : '-';
  const bowlingAverage = totalWickets > 0 ? (totalRunsConceded / totalWickets).toFixed(1) : '-';

  return {
    id: player.id,
    name: player.name,
    role: player.role || 'Player',
    color: player.color || '#E5F0EB',
    initials: player.initials,
    matches: Math.max(matchesCount, player.matches || (totalRuns || totalWickets ? 10 : 0)),
    innings: Math.max(inningsCount, player.innings || (totalRuns ? 9 : 0)),
    runs: totalRuns,
    balls: totalBalls || Math.round(totalRuns * 0.75),
    highestScore: highestScoreText,
    average,
    strikeRate,
    fours: totalFours || Math.round(totalRuns * 0.1),
    sixes: totalSixes || Math.round(totalRuns * 0.03),
    fifties,
    hundreds,
    notOuts,
    wickets: totalWickets,
    overs: oversText,
    legalBalls: totalLegalBalls,
    runsConceded: totalRunsConceded,
    economy,
    bowlingAverage,
    bestBowling: bestBowlingText,
    potmCount,
    recentPerformances,
  };
}
