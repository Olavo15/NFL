const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/special-teams/scoring/2024/reg/all";

async function fetchNFLKickingData() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.goto(URL, { waitUntil: 'networkidle2' });
        await page.waitForSelector('tbody');

        const html = await page.content();
        const $ = cheerio.load(html);
        const teams = [];

        $("tbody tr").each(function () {
            const teamName = $(this).find(".d3-o-club-fullname").text().trim();
            const stats = [];

            $(this).find("td").each(function (index) {
                if (index > 0) {  
                    stats.push($(this).text().trim());
                }
            });

            if (teamName) {
                teams.push({ teamName, stats });
            }
        });

        await browser.close();
        return teams;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

function generateJSON(teams) {
    const jsonData = teams.map(team => {
        const [fgm, fgPercentage, xpm, xpPercentage, kickReturnTD, puntReturnT] = team.stats;

        return {
            name: team.teamName,
            fieldGoalsMade: fgm || '0',
            fieldGoalPercentage: fgPercentage || '0',
            extraPointsMade: xpm || '0',
            extraPointPercentage: xpPercentage || '0',
            kickReturnTouchdowns: kickReturnTD || '0',
            puntReturns: puntReturnT || '0'
        };
    });

    fs.writeFileSync('Docs/nflKickingStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log('JSON file generated successfully!');
}

async function main() {
    const teams = await fetchNFLKickingData();
    if (teams.length > 0) {
        generateJSON(teams);
    } else {
        console.log("No team data found.");
    }
}

module.exports = async function() {
    await main(); 
};
