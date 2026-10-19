// nfl.com/stats team-stats pages render only the club nickname (e.g. "Rams"),
// while nfl.com/standings and other sources use the full club name
// (e.g. "Los Angeles Rams"). This map lets every scraper normalize to the
// full name so all datasets can be joined on the same key.
const NICKNAME_TO_FULLNAME = {
    'Cardinals': 'Arizona Cardinals',
    'Falcons': 'Atlanta Falcons',
    'Ravens': 'Baltimore Ravens',
    'Bills': 'Buffalo Bills',
    'Panthers': 'Carolina Panthers',
    'Bears': 'Chicago Bears',
    'Bengals': 'Cincinnati Bengals',
    'Browns': 'Cleveland Browns',
    'Cowboys': 'Dallas Cowboys',
    'Broncos': 'Denver Broncos',
    'Lions': 'Detroit Lions',
    'Packers': 'Green Bay Packers',
    'Texans': 'Houston Texans',
    'Colts': 'Indianapolis Colts',
    'Jaguars': 'Jacksonville Jaguars',
    'Chiefs': 'Kansas City Chiefs',
    'Raiders': 'Las Vegas Raiders',
    'Chargers': 'Los Angeles Chargers',
    'Rams': 'Los Angeles Rams',
    'Dolphins': 'Miami Dolphins',
    'Vikings': 'Minnesota Vikings',
    'Patriots': 'New England Patriots',
    'Saints': 'New Orleans Saints',
    'Giants': 'New York Giants',
    'Jets': 'New York Jets',
    'Eagles': 'Philadelphia Eagles',
    'Steelers': 'Pittsburgh Steelers',
    '49ers': 'San Francisco 49ers',
    'Seahawks': 'Seattle Seahawks',
    'Buccaneers': 'Tampa Bay Buccaneers',
    'Titans': 'Tennessee Titans',
    'Commanders': 'Washington Commanders'
};

function normalizeNflStatsTeamName(nickname) {
    return NICKNAME_TO_FULLNAME[nickname] || nickname;
}

module.exports = { NICKNAME_TO_FULLNAME, normalizeNflStatsTeamName };
