const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/defense/passing/2024/reg/all";

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
        const [att, cmp, cmpPercent, ydsPerAtt, yds, td, int, rate, first, firstPercent, twentyPlus, fortyPlus, long, sck] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <passAttempts>${att || '0'}</passAttempts>\n`;
        xml += `    <completions>${cmp || '0'}</completions>\n`;
        xml += `    <completionPercentage>${cmpPercent || '0'}</completionPercentage>\n`;
        xml += `    <yardsPerAttempt>${ydsPerAtt || '0'}</yardsPerAttempt>\n`;
        xml += `    <passingYards>${yds || '0'}</passingYards>\n`;
        xml += `    <touchdowns>${td || '0'}</touchdowns>\n`;
        xml += `    <interceptions>${int || '0'}</interceptions>\n`;
        xml += `    <passerRating>${rate || '0'}</passerRating>\n`;
        xml += `    <firstDowns>${first || '0'}</firstDowns>\n`;
        xml += `    <firstDownPercentage>${firstPercent || '0'}</firstDownPercentage>\n`;
        xml += `    <twentyPlus>${twentyPlus || '0'}</twentyPlus>\n`;
        xml += `    <fortyPlus>${fortyPlus || '0'}</fortyPlus>\n`;
        xml += `    <longestPass>${long || '0'}</longestPass>\n`;
        xml += `    <sacks>${sck || '0'}</sacks>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflDefensePassingStats.xml', xml, { encoding: 'utf-8' });
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