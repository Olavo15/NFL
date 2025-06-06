const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const teamNameMap = {
  'N.Y. Giants': 'New York Giants',
  'N.Y. Jets': 'New York Jets',
  'L.A. Rams': 'Los Angeles Rams',
  'L.A. Chargers': 'Los Angeles Chargers',
  'New Orleans': 'New Orleans Saints',
  'Denver': 'Denver Broncos',
  'Jacksonville': 'Jacksonville Jaguars',
  'New England': 'New England Patriots',
  'Cleveland': 'Cleveland Browns',
  'Cincinnati': 'Cincinnati Bengals',
  'Minnesota': 'Minnesota Vikings',
  'Detroit': 'Detroit Lions',
  'Green Bay': 'Green Bay Packers',
  'Houston': 'Houston Texans',
  'Indianapolis': 'Indianapolis Colts',
  'Miami': 'Miami Dolphins',
  'Philadelphia': 'Philadelphia Eagles',
  'Atlanta': 'Atlanta Falcons',
  'Seattle': 'Seattle Seahawks',
  'Buffalo': 'Buffalo Bills',
  'Tennessee': 'Tennessee Titans',
  'Washington': 'Washington Commanders',
  'Carolina': 'Carolina Panthers',
  'Las Vegas': 'Las Vegas Raiders',
  'San Francisco': 'San Francisco 49ers',
  'Kansas City': 'Kansas City Chiefs',
  'Pittsburgh': 'Pittsburgh Steelers',
  'Tampa Bay': 'Tampa Bay Buccaneers',
  'Baltimore': 'Baltimore Ravens',
  'Arizona': 'Arizona Cardinals',
  'Chicago': 'Chicago Bears', 
  'Dallas': 'Dallas Cowboys'
};

const normalizeTeamName = (teamName) => {
  return teamNameMap[teamName] || teamName;
};

function loadJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(chalk.red(`Erro ao ler o arquivo: ${filePath}`));
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

async function loadNflData(directory) {
  const files = {
    scores: 'nfl_scores.json',
    standings: 'nfl_standings.json',
    defense: [
      'nflDefenseDownsStats.json', 'nflDefenseFumblesStats.json', 'nflDefenseInterceptionsStats.json',
      'nflDefensePassingStats.json', 'nflDefenseReceivingStats.json', 'nflDefenseRushingStats.json',
      'nflDefenseScoringStats.json', 'nflDefenseTacklesStats.json'
    ],
    offense: [
      'nflOffenseDownsStats.json', 'nflOffensePassingStats.json', 'nflOffenseReceivingStats.json',
      'nflOffenseRushingStats.json', 'nflOffenseScoringStats.json'
    ],
    special_teams: [
      'nflSpecialTeamsFieldGoalsStats.json', 'nflKickoffReturnStats.json', 'nflKickoffStats.json',
      'nflPuntingStats.json', 'nflKickingStats.json'
    ]
  };

  const data = {};

  try {
    data.scores = await loadJsonFile(path.join(directory, files.scores));
    data.standings = await loadJsonFile(path.join(directory, files.standings));

    data.defense = {};
    for (const file of files.defense) {
      Object.assign(data.defense, await loadJsonFile(path.join(directory, file)));
    }

    data.offense = {};
    for (const file of files.offense) {
      Object.assign(data.offense, await loadJsonFile(path.join(directory, file)));
    }

    data.special_teams = {};
    for (const file of files.special_teams) {
      Object.assign(data.special_teams, await loadJsonFile(path.join(directory, file)));
    }
  } catch (error) {
    console.error(chalk.red("Erro ao carregar os arquivos:", error));
  }

  return data;
}

function calculateTeamScore(teamStats) {
  const winPercentage = parseFloat(teamStats.winPercentage) || 0;
  const pointsFor = parseFloat(teamStats.PF) || 0;
  const pointsAgainst = parseFloat(teamStats.PA) || 0; 
  const offenseYards = parseFloat(teamStats.OffenseYards || 0);
  const defenseYardsAllowed = parseFloat(teamStats.DefenseYardsAllowed || 0);
  const turnoverRatio = parseFloat(teamStats.TurnoverRatio || 0);
  const sacks = parseFloat(teamStats.Sacks || 0);
  const redZoneEfficiency = parseFloat(teamStats.RedZoneEfficiency || 0);

  const pointsAgainstFactor = pointsAgainst > 0 ? (1 / pointsAgainst) : 0;
  const defenseYardsAllowedFactor = defenseYardsAllowed > 0 ? (1 / defenseYardsAllowed) : 0;

  const score = (winPercentage * 0.5) + (pointsFor * 0.15) + (pointsAgainstFactor * 0.1)
                + (offenseYards * 0.1) + (defenseYardsAllowedFactor * 0.05)
                + (turnoverRatio * 0.05) + (sacks * 0.03) + (redZoneEfficiency * 0.02);

  return score;
}

function cleanTeamNameFromJson(rawTeamName) {
  return rawTeamName
           .replace(/\s+/g, ' ') 
           .replace(/\n/g, '')   
           .replace(/(xz\*|xz|xy)$/, '')
           .trim(); 
}

function getCombinedTeamStats(teamName, nflData) {
  const targetTeamNameClean = teamName.toLowerCase();

  const teamStats = nflData.standings.find(
    (team) => cleanTeamNameFromJson(team.teamName).toLowerCase() === targetTeamNameClean
  );

  if (!teamStats) {
    console.log(chalk.red(`Estatísticas não encontradas para o time: ${teamName}`));
    return null;
  }

  const offenseStats = nflData.offense[teamName] || {};
  const defenseStats = nflData.defense[teamName] || {};
  const specialTeamsStats = nflData.special_teams[teamName] || {};

  console.log(chalk.yellow(`Estatísticas combinadas para ${teamName}:`), {
    ...teamStats,
    ...offenseStats,
    ...defenseStats,
    ...specialTeamsStats
  });

  return { ...teamStats, ...offenseStats, ...defenseStats, ...specialTeamsStats };
}


function predictWinnersForAllGames(nflData) {
  if (!nflData.scores || nflData.scores.length === 0) {
    return chalk.red('Nenhuma partida encontrada nos dados de scores.');
  }

  const predictions = nflData.scores.map((game) => {
    const homeTeam = normalizeTeamName(game.homeTeam);
    const awayTeam = normalizeTeamName(game.awayTeam);

    const homeTeamStats = getCombinedTeamStats(homeTeam, nflData);
    const awayTeamStats = getCombinedTeamStats(awayTeam, nflData);

    if (!homeTeamStats || !awayTeamStats) {
      const missingTeams = [];
      if (!homeTeamStats) missingTeams.push(homeTeam);
      if (!awayTeamStats) missingTeams.push(awayTeam);
      return `Erro: Não foi possível encontrar as estatísticas para o(s) time(s): ${missingTeams.join(', ')}.`;
    }

    const homeTeamScore = calculateTeamScore(homeTeamStats);
    const awayTeamScore = calculateTeamScore(awayTeamStats);

    console.log(chalk.blue(`Score do ${homeTeam}: ${homeTeamScore.toFixed(2)}`));
    console.log(chalk.blue(`Score do ${awayTeam}: ${awayTeamScore.toFixed(2)}`));

    const predictedWinner = homeTeamScore > awayTeamScore ? homeTeam : awayTeam;
    return `Vencedor previsto para o jogo entre ${game.homeTeam} e ${game.awayTeam}: ${predictedWinner}`;
  });

  return predictions.join('\n');
}

function savePredictions(predictions) {
  const filePath = path.join(__dirname, 'predictions.txt');
  fs.writeFile(filePath, predictions, 'utf8', (err) => {
    if (err) {
      console.error(chalk.red('Erro ao salvar as previsões:', err));
    } else {
      console.log(chalk.greenBright(`Previsões salvas com sucesso em ${filePath}`));
    }
  });
}

async function main() {
  const directory = 'Docs/';
  const nflData = await loadNflData(directory);

  if (nflData && nflData.scores && nflData.standings) {
    const predictions = predictWinnersForAllGames(nflData);
    console.log(predictions);
    savePredictions(predictions);
    deleteDirectory(directory);
  } else {
    console.log('Falha ao carregar todos os dados necessários da NFL.');
  }
}

function deleteDirectory(directory) {
  fs.rm(directory, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(chalk.red(`Erro ao apagar o diretório ${directory}:`, err));
    } else {
      console.log(chalk.greenBright(`Diretório ${directory} apagado com sucesso.`));
    }
  });
}

main();