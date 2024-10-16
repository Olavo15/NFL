const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/special-teams/punting/2024/reg/all";

async function fetchNFLPuntingData() {
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
        const [netAvg, netYds, punts, avg, lng, yds, in20, oob, dn, tb, fc, ret, retY, td, pBlk] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <netAverage>${netAvg || '0'}</netAverage>\n`;
        xml += `    <netYards>${netYds || '0'}</netYards>\n`;
        xml += `    <punts>${punts || '0'}</punts>\n`;
        xml += `    <average>${avg || '0'}</average>\n`;
        xml += `    <longest>${lng || '0'}</longest>\n`;
        xml += `    <yards>${yds || '0'}</yards>\n`;
        xml += `    <in20>${in20 || '0'}</in20>\n`;
        xml += `    <outOfBounds>${oob || '0'}</outOfBounds>\n`;
        xml += `    <down>${dn || '0'}</down>\n`;
        xml += `    <touchbacks>${tb || '0'}</touchbacks>\n`;
        xml += `    <fairCatches>${fc || '0'}</fairCatches>\n`;
        xml += `    <returns>${ret || '0'}</returns>\n`;
        xml += `    <returnYards>${retY || '0'}</returnYards>\n`;
        xml += `    <touchdowns>${td || '0'}</touchdowns>\n`;
        xml += `    <puntsBlocked>${pBlk || '0'}</puntsBlocked>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflPuntingStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLPuntingData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
