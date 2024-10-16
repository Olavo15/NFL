const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/scores/";

async function fetchNFLScores() {
    try {
        const response = await axios.get(URL);

        if (response.status !== 200) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const html = response.data;
        const $ = cheerio.load(html);
        const games = [];

        
        const selectorTeams = 'nfl-c-matchup-strip__team-fullname'; 
        const teams = $(selectorTeams);

        console.log(`Total de times encontrados: ${teams.length}`);

        for (let i = 0; i < teams.length; i += 2) {
            const homeTeam = $(teams[i]).text().trim();
            const awayTeam = $(teams[i + 1]).text().trim();

            console.log(`Home Team: ${homeTeam}, Away Team: ${awayTeam}`);

            if (homeTeam && awayTeam) {
                games.push({
                    homeTeam,
                    awayTeam
                });
            }
        }

        return games;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

function generateScoresXML(games) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += '<games>\n';

    games.forEach(game => {
        xml += `  <game>\n`;
        xml += `    <homeTeam>${game.homeTeam}</homeTeam>\n`;
        xml += `    <awayTeam>${game.awayTeam}</awayTeam>\n`;
        xml += `  </game>\n`;
    });

    xml += '</games>\n';

    fs.writeFileSync('Docs/nfl_scores.xml', xml, { encoding: 'utf-8' });
    console.log('XML file with scores generated successfully!');
}

async function main() {
    const games = await fetchNFLScores();
    console.log(`Total de jogos encontrados: ${games.length}`);
    if (games.length > 0) {
        generateScoresXML(games);
    } else {
        console.log('No games found.');
    }
}

main();
