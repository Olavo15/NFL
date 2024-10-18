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

function saveToJSON(teams) {
    const jsonData = teams.map(team => ({
        teamName: team.teamName,
        wins: team.stats[0] || '0',
        losses: team.stats[1] || '0',
        ties: team.stats[2] || '0',
        winPercentage: team.stats[3] || '0',
        PF: team.stats[4] || '0',
        PA: team.stats[5] || '0',
        NetPts: team.stats[6] || '0',
        Div: team.stats[7] || '0',
        Pct: team.stats[8] || '0',
        Conf: team.stats[9] || '0',
        PctDiv: team.stats[10] || '0',
        Non_Conf: team.stats[11] || '0',
        Strk: team.stats[12] || '0',
        Last_5: team.stats[13] || '0'
    }));

    fs.writeFileSync('Docs/nfl_standings.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log('JSON file generated successfully!');
}

async function main() {
    const teams = await fetchNFLData();
    if (teams.length > 0) {
        saveToJSON(teams);
    } else {
        console.log('No teams found.');
    }
}

module.exports = async function() {
    await main(); 
};