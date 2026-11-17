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
  {
    id: 'm1',
    status: 'LIVE',
    format: 'T20',
    venue: 'Riverside Cricket Ground',
    home: 'harbor',
    away: 'royals',
    innings: 'Harbor Hawks 1st innings',
    score: 142,
    wickets: 4,
    overs: '16.3',
    totalOvers: 20,
    target: null,
    batters: [
      { name: 'A. Patel', runs: 64, balls: 42, fours: 7, sixes: 2, onStrike: true },
      { name: 'J. Morgan', runs: 18, balls: 13, fours: 2, sixes: 0, onStrike: false },
    ],
    battingCard: [
      { name: 'A. Patel', runs: 64, balls: 42, fours: 7, sixes: 2, dismissed: false },
      { name: 'J. Morgan', runs: 18, balls: 13, fours: 2, sixes: 0, dismissed: false },
    ],
    battingPlayers: ['A. Patel', 'J. Morgan', 'R. Sharma', 'V. Kohli', 'K. Rahul', 'H. Pandya', 'R. Jadeja', 'R. Ashwin', 'B. Kumar', 'M. Shami', 'J. Bumrah'],
    bowlingPlayers: ['S. Khan', 'M. Shah', 'T. Boult', 'M. Starc', 'P. Cummins'],
    bowler: { name: 'S. Khan', overs: '3.3', runs: 29, wickets: 2, legalBalls: 21 },
    bowlingStats: {
      'S. Khan': { runs: 29, wickets: 2, legalBalls: 21 },
      'M. Shah': { runs: 34, wickets: 1, legalBalls: 24 },
    },
    overHistory: demoOverHistory,
    lastBalls: ['1', '4', 'DOT', '2', '1', '4'],
  },
  { id: 'm2', status: 'UPCOMING', format: 'T20', venue: 'Central Sports Park', home: 'strikers', away: 'rangers', time: 'TODAY  -  6:30 PM' },
  { id: 'm3', status: 'COMPLETED', format: 'T10', venue: 'Riverside Cricket Ground', home: 'royals', away: 'strikers', result: 'City Royals won by 18 runs', homeScore: '106/4', awayScore: '88/8', homeWickets: 4, awayWickets: 8, homeOvers: '10.0', awayOvers: '10.0', wickets: 4, playerOfMatch: 'Sameer Khan' },
];

export const getPlayerInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const playerColors = ['#E5F0EB', '#F5EADF', '#E9E9F7', '#EAF0F3', '#FCECE8', '#FAF0E6', '#E8F5E9', '#EDE7F6'];

export const players = [
  { id: 'p1', name: 'Arjun Patel', role: 'All-rounder - Captain', initials: 'AP', color: '#E5F0EB', runs: 284, balls: 204, matches: 12, innings: 11, fours: 28, sixes: 8, highestScore: '68*', notOuts: 3, wickets: 8, legalBalls: 168, runsConceded: 184, bestBowling: '2/18', potmCount: 2 },
  { id: 'p2', name: 'Jordan Morgan', role: 'Opening batter', initials: 'JM', color: '#F5EADF', runs: 216, balls: 168, matches: 10, innings: 10, fours: 24, sixes: 5, highestScore: '58', notOuts: 1, wickets: 0, legalBalls: 0, runsConceded: 0, bestBowling: '-', potmCount: 1 },
  { id: 'p3', name: 'Sameer Khan', role: 'Fast bowler', initials: 'SK', color: '#E9E9F7', runs: 43, balls: 32, matches: 11, innings: 6, fours: 4, sixes: 1, highestScore: '18*', notOuts: 2, wickets: 14, legalBalls: 216, runsConceded: 228, bestBowling: '3/19', potmCount: 2 },
  { id: 'p4', name: "Liam O'Connor", role: 'Wicketkeeper', initials: 'LO', color: '#EAF0F3', runs: 172, balls: 135, matches: 9, innings: 9, fours: 19, sixes: 3, highestScore: '46', notOuts: 0, wickets: 0, legalBalls: 0, runsConceded: 0, bestBowling: '-', potmCount: 0 },
  { id: 'p5', name: 'Rohit Sharma', role: 'Top-order batter', initials: 'RS', color: '#E5F0EB', runs: 420, balls: 296, matches: 14, innings: 14, fours: 42, sixes: 16, highestScore: '89*', notOuts: 2, wickets: 2, legalBalls: 36, runsConceded: 44, bestBowling: '1/12', potmCount: 3 },
  { id: 'p6', name: 'Virat Kohli', role: 'Top-order batter', initials: 'VK', color: '#F5EADF', runs: 512, balls: 374, matches: 15, innings: 15, fours: 50, sixes: 11, highestScore: '94*', notOuts: 4, wickets: 4, legalBalls: 48, runsConceded: 56, bestBowling: '2/16', potmCount: 4 },
  { id: 'p7', name: 'Jasprit Bumrah', role: 'Fast bowler', initials: 'JB', color: '#E9E9F7', runs: 35, balls: 29, matches: 16, innings: 7, fours: 3, sixes: 1, highestScore: '14*', notOuts: 3, wickets: 22, legalBalls: 324, runsConceded: 298, bestBowling: '4/18', potmCount: 5 },
  { id: 'p8', name: 'Hardik Pandya', role: 'All-rounder', initials: 'HP', color: '#EAF0F3', runs: 290, balls: 182, matches: 13, innings: 12, fours: 26, sixes: 15, highestScore: '62*', notOuts: 2, wickets: 12, legalBalls: 204, runsConceded: 232, bestBowling: '3/24', potmCount: 2 },
];

export const getTeam = (team) => typeof team === 'object' ? team : teams.find((item) => item.id === team);
