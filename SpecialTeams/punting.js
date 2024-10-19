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

function generateJSON(teams) {
    const jsonData = teams.map(team => {
        const [netAvg, netYds, punts, avg, lng, yds, in20, oob, dn, tb, fc, ret, retY, td, pBlk] = team.stats;

        return {
            name: team.teamName,
            netAverage: netAvg || '0',
            netYards: netYds || '0',
            punts: punts || '0',
            average: avg || '0',
            longest: lng || '0',
            yards: yds || '0',
            in20: in20 || '0',
            outOfBounds: oob || '0',
            down: dn || '0',
            touchbacks: tb || '0',
            fairCatches: fc || '0',
            returns: ret || '0',
            returnYards: retY || '0',
            touchdowns: td || '0',
            puntsBlocked: pBlk || '0'
        };
    });

    fs.writeFileSync('Docs/nflPuntingStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log('JSON file generated successfully!');
}

async function main() {
    const teams = await fetchNFLPuntingData();
    if (teams.length > 0) {
        generateJSON(teams);
    } else {
        console.log("No team data found.");
    }
}

module.exports = async function() {
    await main(); 
};