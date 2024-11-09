const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');

const URL = "https://www.nfl.com/stats/team-stats/special-teams/field-goals/2024/reg/all";

async function fetchNFLFieldGoalData() {
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
        const [fgm, attempts, fgPercentage, fg1to19, fg20to29, fg30to39, fg40to49, fg50to59, fg60Plus, longest, fgBlocked] = team.stats;

        return {
            name: team.teamName,
            fieldGoalsMade: fgm || '0',
            attempts: attempts || '0',
            fieldGoalPercentage: fgPercentage || '0',
            fg1to19: fg1to19 || '0',
            fg20to29: fg20to29 || '0',
            fg30to39: fg30to39 || '0',
            fg40to49: fg40to49 || '0',
            fg50to59: fg50to59 || '0',
            fg60Plus: fg60Plus || '0',
            longest: longest || '0',
            fgBlocked: fgBlocked || '0'
        };
    });

    fs.writeFileSync('Docs/nflSpecialTeamsFieldGoalsStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log(chalk.green('JSON file generated successfully!'));
}

async function main() {
    const teams = await fetchNFLFieldGoalData();
    if (teams.length > 0) {
        generateJSON(teams);
    } else {
        console.log(chalk.red("No team data found."));
    }
}

module.exports = async function() {
    await main(); 
};