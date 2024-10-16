const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/special-teams/punt-returns/2024/reg/all";

async function fetchNFLPuntReturnData() {
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
        const [avg, ret, yds, pRetT, twentyPlus, fortyPlus, lng, fc, fum, pBlk] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <average>${avg || '0'}</average>\n`;
        xml += `    <returns>${ret || '0'}</returns>\n`;
        xml += `    <yards>${yds || '0'}</yards>\n`;
        xml += `    <puntReturnTouchdowns>${pRetT || '0'}</puntReturnTouchdowns>\n`;
        xml += `    <twentyPlus>${twentyPlus || '0'}</twentyPlus>\n`;
        xml += `    <fortyPlus>${fortyPlus || '0'}</fortyPlus>\n`;
        xml += `    <longest>${lng || '0'}</longest>\n`;
        xml += `    <fairCatches>${fc || '0'}</fairCatches>\n`;
        xml += `    <fumbles>${fum || '0'}</fumbles>\n`;
        xml += `    <puntsBlocked>${pBlk || '0'}</puntsBlocked>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflPuntReturnStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLPuntReturnData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
