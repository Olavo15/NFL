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

function generateXML(teams) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += '<teams>\n';

    teams.forEach(team => {
        const [avg, ret, yds, kRetTD, twentyPlus, fortyPlus, lng, fc, fum, fgBlk, xpBlk] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <average>${avg || '0'}</average>\n`;
        xml += `    <returns>${ret || '0'}</returns>\n`;
        xml += `    <yards>${yds || '0'}</yards>\n`;
        xml += `    <kickReturnTouchdowns>${kRetTD || '0'}</kickReturnTouchdowns>\n`;
        xml += `    <returns20Plus>${twentyPlus || '0'}</returns20Plus>\n`;
        xml += `    <returns40Plus>${fortyPlus || '0'}</returns40Plus>\n`;
        xml += `    <longestReturn>${lng || '0'}</longestReturn>\n`;
        xml += `    <fairCatches>${fc || '0'}</fairCatches>\n`;
        xml += `    <fumbles>${fum || '0'}</fumbles>\n`;
        xml += `    <fieldGoalBlocks>${fgBlk || '0'}</fieldGoalBlocks>\n`;
        xml += `    <extraPointBlocks>${xpBlk || '0'}</extraPointBlocks>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflKickoffReturnStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLKickoffReturnData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
