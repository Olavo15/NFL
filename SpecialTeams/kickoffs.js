const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');

const URL = "https://www.nfl.com/stats/team-stats/special-teams/kickoffs/2024/reg/all";

async function fetchNFLKickoffData() {
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
        const [ko, yds, tb, tbPct, ret, retAvg, osk, oskRec, oob, td] = team.stats;

        return {
            name: team.teamName,
            kickoffs: ko || '0',
            yards: yds || '0',
            touchbacks: tb || '0',
            touchbackPercentage: tbPct || '0',
            returns: ret || '0',
            returnAverage: retAvg || '0',
            onsideKicks: osk || '0',
            onsideKickRecoveries: oskRec || '0',
            outOfBounds: oob || '0',
            touchdowns: td || '0'
        };
    });

    fs.writeFileSync('Docs/nflKickoffStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log(chalk.green('JSON file generated successfully!'));
}

async function main() {
    const teams = await fetchNFLKickoffData();
    if (teams.length > 0) {
        generateJSON(teams);
    } else {
        console.log("No team data found.");
    }
}

module.exports = async function() {
    await main(); 
};