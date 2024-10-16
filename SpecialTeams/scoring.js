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

function generateXML(teams) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += '<teams>\n';

    teams.forEach(team => {
        const [fgm, fgPercentage, xpm, xpPercentage, kickReturnTD, puntReturnT] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <fieldGoalsMade>${fgm || '0'}</fieldGoalsMade>\n`;
        xml += `    <fieldGoalPercentage>${fgPercentage || '0'}</fieldGoalPercentage>\n`;
        xml += `    <extraPointsMade>${xpm || '0'}</extraPointsMade>\n`;
        xml += `    <extraPointPercentage>${xpPercentage || '0'}</extraPointPercentage>\n`;
        xml += `    <kickReturnTouchdowns>${kickReturnTD || '0'}</kickReturnTouchdowns>\n`;
        xml += `    <puntReturns>${puntReturnT || '0'}</puntReturns>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflKickingStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLKickingData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
