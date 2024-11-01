const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');

const URL = "https://www.nfl.com/stats/team-stats/defense/interceptions/2024/reg/all";

async function fetchNFLInterceptionData() {
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
        interceptions: team.stats[0] || '0',
        interceptionTDs: team.stats[1] || '0',
        interceptionYards: team.stats[2] || '0',
        longestInterceptionReturn: team.stats[3] || '0'
    }));

    fs.writeFileSync('Docs/nflDefenseInterceptionsStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log(chalk.green('JSON file generated successfully!'));
}

async function main() {
    const teams = await fetchNFLScoringData();
    if (teams.length > 0) {
        saveToJSON(teams);
    } else {
        console.log(chalk.red("No team data found."));
    }
}

module.exports = async function() {
    await main(); 
};
