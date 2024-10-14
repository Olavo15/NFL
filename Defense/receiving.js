const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/defense/receiving/2024/reg/all";

async function fetchNFLReceivingData() {
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
        const [rec, yds, ydsPerRec, touchdowns, receptions20Plus, receptions40Plus, longReception, recFirstDowns, recFirstDownPct, recFumbles] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <receptions>${rec || '0'}</receptions>\n`;
        xml += `    <receivingYards>${yds || '0'}</receivingYards>\n`;
        xml += `    <yardsPerReception>${ydsPerRec || '0'}</yardsPerReception>\n`;
        xml += `    <touchdowns>${touchdowns || '0'}</touchdowns>\n`;
        xml += `    <receptions20Plus>${receptions20Plus || '0'}</receptions20Plus>\n`;
        xml += `    <receptions40Plus>${receptions40Plus || '0'}</receptions40Plus>\n`;
        xml += `    <longReception>${longReception || '0'}</longReception>\n`;
        xml += `    <recFirstDowns>${recFirstDowns || '0'}</recFirstDowns>\n`;
        xml += `    <recFirstDownPct>${recFirstDownPct || '0'}</recFirstDownPct>\n`;
        xml += `    <recFumbles>${recFumbles || '0'}</recFumbles>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflDefenseReceivingStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLReceivingData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
