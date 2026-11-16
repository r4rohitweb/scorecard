export const teams = [
  { id: 'harbor', name: 'Harbor Hawks', short: 'HH', color: '#187B62', played: 8, won: 6, lost: 2 },
  { id: 'royals', name: 'City Royals', short: 'CR', color: '#CF6337', played: 8, won: 5, lost: 3 },
  { id: 'strikers', name: 'Metro Strikers', short: 'MS', color: '#5265B8', played: 7, won: 4, lost: 3 },
  { id: 'rangers', name: 'Westside Rangers', short: 'WR', color: '#B88A31', played: 8, won: 3, lost: 5 },
];

const demoOver = (over, runs, wickets, bowler, complete = true, sampleBalls) => {
  const labels = sampleBalls || [];
  if (!sampleBalls) {
    let remaining = runs;
    for (let i = 0; i < 6 - wickets; i += 1) {
      const ballRuns = Math.min(4, remaining);
      labels.push(`${ballRuns}`);
      remaining -= ballRuns;
    }
    for (let i = 0; i < wickets; i += 1) labels.push('W');
  }
  return { over, runs, wickets, balls: labels.map((label) => ({ label, runs: Number(label) || 0, legal: true, wicket: label === 'W' })), bowler, complete };
};

const demoOverHistory = [
  [8, 0], [7, 0], [10, 1], [8, 0], [12, 0], [9, 0], [11, 1], [7, 0],
  [12, 0], [8, 0], [10, 0], [9, 0], [8, 0], [9, 1], [7, 1], [2, 0],
].map(([runs, wickets], index) => demoOver(index + 1, runs, wickets, index % 4 === 3 ? 'M. Shah' : 'S. Khan'));
demoOverHistory.push(demoOver(17, 5, 0, 'S. Khan', false, ['1', '4', '0']));

export const matches = [
  { id: 'm1', status: 'LIVE', format: 'T20', venue: 'Riverside Cricket Ground', home: 'harbor', away: 'royals', innings: 'Harbor Hawks 1st innings', score: 142, wickets: 4, overs: '16.3', target: null, batters: [{ name: 'A. Patel', runs: 64, balls: 42, onStrike: true }, { name: 'J. Morgan', runs: 18, balls: 13 }], bowler: { name: 'S. Khan', overs: '3.3', runs: 29, wickets: 2 }, overHistory: demoOverHistory, lastBalls: ['1', '4', 'DOT', '2', '1', '4'] },
  { id: 'm2', status: 'UPCOMING', format: 'T20', venue: 'Central Sports Park', home: 'strikers', away: 'rangers', time: 'TODAY  -  6:30 PM' },
  { id: 'm3', status: 'COMPLETED', format: 'T10', venue: 'Riverside Cricket Ground', home: 'royals', away: 'strikers', result: 'City Royals won by 18 runs', homeScore: '106/4', awayScore: '88/8' },
];

export const players = [
  { name: 'Arjun Patel', role: 'All-rounder  -  Captain', initials: 'AP', color: '#E5F0EB', runs: 284, wickets: 8 },
  { name: 'Jordan Morgan', role: 'Opening batter', initials: 'JM', color: '#F5EADF', runs: 216, wickets: 0 },
  { name: 'Sameer Khan', role: 'Fast bowler', initials: 'SK', color: '#E9E9F7', runs: 43, wickets: 14 },
  { name: "Liam O'Connor", role: 'Wicketkeeper', initials: 'LO', color: '#EAF0F3', runs: 172, wickets: 0 },
];

export const getTeam = (team) => typeof team === 'object' ? team : teams.find((item) => item.id === team);
