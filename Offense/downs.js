const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');


const URL = "https://www.nfl.com/stats/team-stats/offense/downs/2024/reg/all";

async function fetchNFLScoringData() {
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
        const [
            threeRdAtt,    
            threeRdMd,     
            fourThAtt,     
            fourThMd,      
            recOneSt,      
            recOneStPct,
            rushOneSt,     
            rushOneStPct,   
            scrmPlys       
        ] = team.stats;

        xml += `  <team>\n`;
        xml += `    <name>${team.teamName}</name>\n`;
        xml += `    <thirdDownAttempts>${threeRdAtt || '0'}</thirdDownAttempts>\n`;
        xml += `    <thirdDownMade>${threeRdMd || '0'}</thirdDownMade>\n`;
        xml += `    <fourthDownAttempts>${fourThAtt || '0'}</fourthDownAttempts>\n`;
        xml += `    <fourthDownMade>${fourThMd || '0'}</fourthDownMade>\n`;
        xml += `    <receivingFirstDowns>${recOneSt || '0'}</receivingFirstDowns>\n`;
        xml += `    <receivingFirstDownPercentage>${recOneStPct || '0'}</receivingFirstDownPercentage>\n`;
        xml += `    <rushingFirstDowns>${rushOneSt || '0'}</rushingFirstDowns>\n`;
        xml += `    <rushingFirstDownPercentage>${rushOneStPct || '0'}</rushingFirstDownPercentage>\n`;
        xml += `    <scrimmagePlays>${scrmPlys || '0'}</scrimmagePlays>\n`;
        xml += `  </team>\n`;
    });

    xml += '</teams>\n';
    fs.writeFileSync('Docs/nflOffenseDownsStats.xml', xml, { encoding: 'utf-8' });
    console.log('XML file generated successfully!');
}

async function main() {
    const teams = await fetchNFLScoringData();
    if (teams.length > 0) {
        generateXML(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
