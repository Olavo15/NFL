const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/special-teams/kickoff-return/2024/reg/all";

async function fetchNFLKickoffReturnData() {
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
        const [avg, ret, yds, kRetTD, twentyPlus, fortyPlus, lng, fc, fum, fgBlk, xpBlk] = team.stats;

        return {
            name: team.teamName,
            average: avg || '0',
            returns: ret || '0',
            yards: yds || '0',
            kickReturnTouchdowns: kRetTD || '0',
            returns20Plus: twentyPlus || '0',
            returns40Plus: fortyPlus || '0',
            longestReturn: lng || '0',
            fairCatches: fc || '0',
            fumbles: fum || '0',
            fieldGoalBlocks: fgBlk || '0',
            extraPointBlocks: xpBlk || '0'
        };
    });

    fs.writeFileSync('Docs/nflKickoffReturnStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log('JSON file generated successfully!');
}

async function main() {
    const teams = await fetchNFLKickoffReturnData();
    if (teams.length > 0) {
        generateJSON(teams);
    } else {
        console.log("No team data found.");
    }
}

module.exports = async function() {
    await main(); 
};