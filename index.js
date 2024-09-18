const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/standings/";

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
            const teamName = $(this).find(".d3-o-club-fullname").text().trim();
            const teamShortName = $(this).find(".d3-o-club-shortname").text().trim();
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
        xml += `    <wins>${wins || 'N/A'}</wins>\n`;
        xml += `    <losses>${losses || 'N/A'}</losses>\n`;
        xml += `    <ties>${ties || 'N/A'}</ties>\n`;
        xml += `    <winPercentage>${winPercentage || 'N/A'}</winPercentage>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';

    fs.writeFileSync('nfl_standings.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLData();
    if (teams.length > 0) {
        generateXML(teams);
    }
}

main();
