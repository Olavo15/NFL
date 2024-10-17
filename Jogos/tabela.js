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
    let versionNumber = 0;

    function updateVersion() {
        versionNumber++;
    }

    updateVersion();

    let xml = `<?xml version="${versionNumber}" encoding="UTF-8"?>\n`;
    xml += '<teams>\n';

    teams.forEach(team => {
        const [wins, losses, ties, winPercentage, PF, PA, NetPts, Div, Pct, Conf, PctDiv, Non_Conf, Strk, Last_5] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <wins>${wins || '0'}</wins>\n`;
        xml += `    <losses>${losses || '0'}</losses>\n`;
        xml += `    <ties>${ties || '0'}</ties>\n`;
        xml += `    <winPercentage>${winPercentage || '0'}</winPercentage>\n`;
        xml += `    <PF>${PF || '0'}</PF>\n`;
        xml += `    <PA>${PA || '0'}</PA>\n`;
        xml += `    <NetPts>${NetPts || '0'}</NetPts>\n`;
        xml += `    <Div>${Div || '0'}</Div>\n`;
        xml += `    <Pct>${Pct || '0'}</Pct>\n`;
        xml += `    <Conf>${Conf || '0'}</Conf>\n`;
        xml += `    <PctDiv>${PctDiv || '0'}</PctDiv>\n`;
        xml += `    <Non_Conf>${Non_Conf || '0'}</Non_Conf>\n`;
        xml += `    <Strk>${Strk || '0'}</Strk>\n`;
        xml += `    <Last_5>${Last_5 || '0'}</Last_5>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';

    fs.writeFileSync('Docs/nfl_standings.xml', xml, { encoding: 'utf-8' });
    console.log('xml file generated successfully!');
}

async function main() {
    const teams = await fetchNFLData();
    if (teams.length > 0) {
        generateXML(teams);
    }
}

main();
