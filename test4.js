const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const teamNameMap = {
  'N.Y. Giants': 'New York Giants',
  'N.Y. Jets': 'New York Jets',
  'L.A. Rams': 'Los Angeles Rams',
  'L.A. Chargers': 'Los Angeles Chargers',
  // ... demais mapeamentos
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
  const winPercentage = parseFloat(teamStats.Percentage) || 0;
  const pointsFor = parseFloat(teamStats.PointsFor) || 0;
  const pointsAgainst = parseFloat(teamStats.PointsAgainst) || 0;
  const offenseYards = parseFloat(teamStats.OffenseYards) || 0;
  const defenseYardsAllowed = parseFloat(teamStats.DefenseYardsAllowed) || 0;
  const turnoverRatio = parseFloat(teamStats.TurnoverRatio) || 0;
  const sacks = parseFloat(teamStats.Sacks) || 0;
  const redZoneEfficiency = parseFloat(teamStats.RedZoneEfficiency) || 0;

  const score = (winPercentage * 0.5) + (pointsFor * 0.15) + ((1 / pointsAgainst) * 0.1)
                + (offenseYards * 0.1) + ((1 / defenseYardsAllowed) * 0.05)
                + (turnoverRatio * 0.05) + (sacks * 0.03) + (redZoneEfficiency * 0.02);

  return score;
}

function getCombinedTeamStats(teamName, nflData) {
  const teamStats = nflData.standings.find(
    (team) => team.teamName.toLowerCase() === teamName.toLowerCase()
  );

  if (!teamStats) return null;

  const offenseStats = nflData.offense[teamName] || {};
  const defenseStats = nflData.defense[teamName] || {};
  const specialTeamsStats = nflData.special_teams[teamName] || {};

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
