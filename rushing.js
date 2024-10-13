const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/offense/rushing/2024/reg/all";

async function fetchNFLRushingData() {
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
        const [rushAttempts, rushingYards, yardsPerCarry, touchdowns, rushes20Plus, rushes40Plus, longRush, rushFirstDowns, rushFirstDownPct, rushFumbles] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <rushAttempts>${rushAttempts || '0'}</rushAttempts>\n`;
        xml += `    <rushingYards>${rushingYards || '0'}</rushingYards>\n`;
        xml += `    <yardsPerCarry>${yardsPerCarry || '0'}</yardsPerCarry>\n`;
        xml += `    <touchdowns>${touchdowns || '0'}</touchdowns>\n`;
        xml += `    <rushes20Plus>${rushes20Plus || '0'}</rushes20Plus>\n`;
        xml += `    <rushes40Plus>${rushes40Plus || '0'}</rushes40Plus>\n`;
        xml += `    <longRush>${longRush || '0'}</longRush>\n`;
        xml += `    <rushFirstDowns>${rushFirstDowns || '0'}</rushFirstDowns>\n`;
        xml += `    <rushFirstDownPct>${rushFirstDownPct || '0'}</rushFirstDownPct>\n`;
        xml += `    <rushFumbles>${rushFumbles || '0'}</rushFumbles>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nfl_rushing_stats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLRushingData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();

