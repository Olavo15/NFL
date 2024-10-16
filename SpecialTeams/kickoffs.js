const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');


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

function generateXML(teams) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += '<teams>\n';

    teams.forEach(team => {
        const [ko, yds, tb, tbPct, ret, retAvg, osk, oskRec, oob, td] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <kickoffs>${ko || '0'}</kickoffs>\n`;
        xml += `    <yards>${yds || '0'}</yards>\n`;
        xml += `    <touchbacks>${tb || '0'}</touchbacks>\n`;
        xml += `    <touchbackPercentage>${tbPct || '0'}</touchbackPercentage>\n`;
        xml += `    <returns>${ret || '0'}</returns>\n`;
        xml += `    <returnAverage>${retAvg || '0'}</returnAverage>\n`;
        xml += `    <onsideKicks>${osk || '0'}</onsideKicks>\n`;
        xml += `    <onsideKickRecoveries>${oskRec || '0'}</onsideKickRecoveries>\n`;
        xml += `    <outOfBounds>${oob || '0'}</outOfBounds>\n`;
        xml += `    <touchdowns>${td || '0'}</touchdowns>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflKickoffStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLKickoffData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
