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
      data.defense[file] = await loadJsonFile(path.join(directory, file));
    }

    data.offense = {};
    for (const file of files.offense) {
      data.offense[file] = await loadJsonFile(path.join(directory, file));
    }

    data.special_teams = {};
    for (const file of files.special_teams) {
      data.special_teams[file] = await loadJsonFile(path.join(directory, file));
    }
  } catch (error) {
    console.error(chalk.red("Erro ao carregar os arquivos:", error));
  }

  return data;
}

function calculateTeamScore(teamStats) {
  const winPercentage = parseFloat(teamStats.Percentage);
  const pointsFor = parseFloat(teamStats.PointsFor);
  const pointsAgainst = parseFloat(teamStats.PointsAgainst);
  const offenseYards = parseFloat(teamStats.OffenseYards);
  const defenseYardsAllowed = parseFloat(teamStats.DefenseYardsAllowed);
  const turnoverRatio = parseFloat(teamStats.TurnoverRatio) || 0;
  const sacks = parseFloat(teamStats.Sacks) || 0;
  const redZoneEfficiency = parseFloat(teamStats.RedZoneEfficiency) || 0;

  const score = (winPercentage * 0.5) + (pointsFor * 0.15) + ((1 / pointsAgainst) * 0.1)
                + (offenseYards * 0.1) + ((1 / defenseYardsAllowed) * 0.05)
                + (turnoverRatio * 0.05) + (sacks * 0.03) + (redZoneEfficiency * 0.02);

  return score;
}

function predictWinnersForAllGames(nflData) {
  if (!nflData.scores || nflData.scores.length === 0) {
    return chalk.red('Nenhuma partida encontrada nos dados de scores.');
  }

  const predictions = nflData.scores.map((game) => {
    const homeTeam = normalizeTeamName(game.homeTeam);
    const awayTeam = normalizeTeamName(game.awayTeam);

    const homeTeamStats = nflData.standings.find(team =>
      team.teamName.toLowerCase() === homeTeam.toLowerCase()
    );
    const awayTeamStats = nflData.standings.find(team =>
      team.teamName.toLowerCase() === awayTeam.toLowerCase()
    );

    if (!homeTeamStats || !awayTeamStats) {
      const missingTeams = [];
      if (!homeTeamStats) missingTeams.push(homeTeam);
      if (!awayTeamStats) missingTeams.push(awayTeam);
      return `Erro: Não foi possível encontrar as estatísticas para o(s) time(s): ${missingTeams.join(', ')}.`;
    }

    const homeTeamScore = calculateTeamScore(homeTeamStats);
    const awayTeamScore = calculateTeamScore(awayTeamStats);

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
