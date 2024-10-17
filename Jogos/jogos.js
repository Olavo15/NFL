const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.cbssports.com/nfl/schedule/";

async function fetchNFLScores() {
    try {
        const response = await axios.get(URL);

        if (response.status !== 200) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const html = response.data;
        const $ = cheerio.load(html);
        const games = [];

        const gameRows = $('tbody tr.TableBase-bodyTr');


        gameRows.each((index, element) => {
            const awayTeam = $(element).find('td:nth-child(1) .TeamName a').text().trim();
            const homeTeam = $(element).find('td:nth-child(2) .TeamName a').text().trim();
            
            


            if (homeTeam && awayTeam) {
                games.push({
                    homeTeam,
                    awayTeam,
            
                });
            }
        });

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
        xml += `  </game>\n\n`;
    });

    xml += '</games>\n';

    fs.writeFileSync('Docs/nfl_scores.xml', xml, { encoding: 'utf-8' });
    console.log('XML file with scores generated successfully!');
}

async function main() {
    const games = await fetchNFLScores();
    if (games.length > 0) {
        generateScoresXML(games);
    } else {
        console.log('No games found.');
    }
}

main();
