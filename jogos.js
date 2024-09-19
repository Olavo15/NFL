const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/scores/";

async function fetchNFLData() {
    try {
        const response = await axios.get(URL);

        if (response.status !== 200) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const html = response.data;
        const $ = cheerio.load(html);
        const teams = [];

        $("tbody tr").each(function() {
            const Game = $(this).find(".css-pdlny6-Row").text().trim();
            const stats = [];

            $(this).find("td").each(function(index) {
                if (index !== 0) {  
                    stats.push($(this).text().trim());
                }
            });

            if (teamName) {
                teams.push({ teamName: teamName || teamShortName, stats });
            }
        });

        return teams;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

function generateXML(teams) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<teams>\n';

    teams.forEach(team => {
        const [wins, losses, ties, winPercentage] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <wins>${wins || '0'}</wins>\n`;
        xml += `    <losses>${losses || '0'}</losses>\n`;
        xml += `    <ties>${ties || '0'}</ties>\n`;
        xml += `    <winPercentage>${winPercentage || '0'}</winPercentage>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';

    fs.writeFileSync('Docs/nfl_standings.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLData();
    if (teams.length > 0) {
        generateXML(teams);
    }
}

main();
