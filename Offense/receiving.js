const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.nfl.com/stats/team-stats/offense/receiving/2024/reg/all";

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

function saveToJSON(teams) {
    const jsonData = teams.map(team => ({
        teamName: team.teamName,
        receptions: team.stats[0] || '0',
        receivingYards: team.stats[1] || '0',
        yardsPerReception: team.stats[2] || '0',
        touchdowns: team.stats[3] || '0',
        receptions20Plus: team.stats[4] || '0',
        receptions40Plus: team.stats[5] || '0',
        longReception: team.stats[6] || '0',
        recFirstDowns: team.stats[7] || '0',
        recFirstDownPct: team.stats[8] || '0',
        recFumbles: team.stats[9] || '0'
    }));

    fs.writeFileSync('Docs/nflOffenseReceivingStats.json', JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log('JSON file generated successfully!');
}

async function main() {
    const teams = await fetchNFLReceivingData();
    if (teams.length > 0) {
        saveToJSON(teams);
    } else {
        console.log("No team data found.");
    }
}

main();
