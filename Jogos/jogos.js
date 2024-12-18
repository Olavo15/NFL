const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');

const URL = "https://www.cbssports.com/nfl/schedule/";

async function fetchNFLScores() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(URL, { waitUntil: 'networkidle2' });

        const html = await page.content();
        const $ = cheerio.load(html);
        const games = [];

        const gameRows = $('tbody tr.TableBase-bodyTr');

        gameRows.each((index, element) => {
            const awayTeam = $(element).find('td:nth-child(1) .TeamName a').text().trim();
            const homeTeam = $(element).find('td:nth-child(2) .TeamName a').text().trim();
            const TimeTv = $(element).find('td:nth-child(3)').text().trim();

            if (homeTeam && awayTeam) {
                games.push({
                    homeTeam,
                    awayTeam,
                    TimeTv,
                });
            }
        });

        await browser.close();
        return games;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

function saveToJSON(games) {
    const jsonData = games.map(game => ({
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        TimeTv: game.TimeTv, 
    }));

    fs.writeFileSync(`Docs/nfl_scores.json`, JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
    console.log(chalk.green('JSON file with scores generated successfully!'));
}

async function main() {
    const games = await fetchNFLScores();
    if (games.length > 0) {
        saveToJSON(games);
    } else {
        console.log(chalk.red('No games found.'));
    }
}

module.exports = async function() {
    await main(); 
};
