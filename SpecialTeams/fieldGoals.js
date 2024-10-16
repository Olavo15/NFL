const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');


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

function generateXML(teams) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += '<teams>\n';

    teams.forEach(team => {
        const [fgm, attempts, fgPercentage, fg1to19, fg20to29, fg30to39, fg40to49, fg50to59, fg60Plus, longest, fgBlocked] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <fieldGoalsMade>${fgm || '0'}</fieldGoalsMade>\n`;
        xml += `    <attempts>${attempts || '0'}</attempts>\n`;
        xml += `    <fieldGoalPercentage>${fgPercentage || '0'}</fieldGoalPercentage>\n`;
        xml += `    <fg1to19>${fg1to19 || '0'}</fg1to19>\n`;
        xml += `    <fg20to29>${fg20to29 || '0'}</fg20to29>\n`;
        xml += `    <fg30to39>${fg30to39 || '0'}</fg30to39>\n`;
        xml += `    <fg40to49>${fg40to49 || '0'}</fg40to49>\n`;
        xml += `    <fg50to59>${fg50to59 || '0'}</fg50to59>\n`;
        xml += `    <fg60Plus>${fg60Plus || '0'}</fg60Plus>\n`;
        xml += `    <longest>${longest || '0'}</longest>\n`;
        xml += `    <fgBlocked>${fgBlocked || '0'}</fgBlocked>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflSpecialTeamsFieldGoalsStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLFieldGoalData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
