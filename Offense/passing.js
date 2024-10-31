const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');

const URL = "https://www.nfl.com/stats/team-stats/offense/passing/2024/reg/all";

async function fetchNFLPassingData() {
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

function saveToJSON(teams) {
    const jsonData = teams.map(team => ({
        teamName: team.teamName,
        passAttempts: team.stats[0] || '0',
        completions: team.stats[1] || '0',
        completionPercentage: team.stats[2] || '0',
        yardsPerAttempt: team.stats[3] || '0',
        passingYards: team.stats[4] || '0',
        touchdowns: team.stats[5] || '0',
        interceptions: team.stats[6] || '0',
        passerRating: team.stats[7] || '0',
        longPass: team.stats[8] || '0',
        sackYards: team.stats[9] || '0',
        sacks: team.stats[10] || '0',
        spike: team.stats[11] || '0',
        kneel: team.stats[12] || '0',
        longest: team.stats[13] || '0',
        thirdDownPct: team.stats[14] || '0',
        redZoneTdPct: team.stats[15] || '0'
    }));

    fs.writeFileSync('Docs/nflOffensePassingStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log(chalk.green('JSON file generated successfully!'));
}

async function main() {
    const teams = await fetchNFLPassingData();
    if (teams.length > 0) {
        saveToJSON(teams);
    } else {
        console.log(chalk.red("No team data found."));
    }
}

module.exports = async function() {
    await main(); 
};