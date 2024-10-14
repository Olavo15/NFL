const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/offense/passing/2024/reg/all";

async function fetchNFLPassingData() {
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
        const [passAttempts, completions, completionPercentage, yardsPerAttempt, passingYards, touchdowns, interceptions, passerRating, longPass, sackYards, sacks, spike, kneel, longest, thirdDownPct, redZoneTdPct] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <passAttempts>${passAttempts || '0'}</passAttempts>\n`;
        xml += `    <completions>${completions || '0'}</completions>\n`;
        xml += `    <completionPercentage>${completionPercentage || '0'}</completionPercentage>\n`;
        xml += `    <yardsPerAttempt>${yardsPerAttempt || '0'}</yardsPerAttempt>\n`;
        xml += `    <passingYards>${passingYards || '0'}</passingYards>\n`;
        xml += `    <touchdowns>${touchdowns || '0'}</touchdowns>\n`;
        xml += `    <interceptions>${interceptions || '0'}</interceptions>\n`;
        xml += `    <passerRating>${passerRating || '0'}</passerRating>\n`;
        xml += `    <longPass>${longPass || '0'}</longPass>\n`;
        xml += `    <sackYards>${sackYards || '0'}</sackYards>\n`;
        xml += `    <sacks>${sacks || '0'}</sacks>\n`;
        xml += `    <spike>${spike || '0'}</spike>\n`;
        xml += `    <kneel>${kneel || '0'}</kneel>\n`;
        xml += `    <longest>${longest || '0'}</longest>\n`;
        xml += `    <thirdDownPct>${thirdDownPct || '0'}</thirdDownPct>\n`;
        xml += `    <redZoneTdPct>${redZoneTdPct || '0'}</redZoneTdPct>\n`;
        xml += `  </team>\n`;
    });

    
    xml += '</teams>\n';
    fs.writeFileSync('Docs/nfl_passing_stats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLPassingData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
