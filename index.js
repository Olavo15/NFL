const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const URL = "https://www.espn.com.br/nfl/classificacao";

async function fetchNFLData() {
    try {
        const response = await axios.get(URL);
        const html = response.data;
        const $ = cheerio.load(html);
        const posts = [];

        
        $(".Table__TBODY tr").each(function() {
            const time = $(this).find(".hide-mobile").text().trim();  
            const dados = [];

            
            $(this).find("td").each(function(index) {
                if (index !== 0) {  
                    dados.push($(this).text().trim());
                }
            });

            if (time) {
                posts.push({ time, dados });
            }
        });

        return posts;
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return [];
    }
}

function generateXML(posts) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<times>\n';

    posts.forEach(post => {
        const [vitorias, derrotas, empates, porcentagemVit] = post.dados;

        xml += `  <time>\n`;
        xml += `    <nome>${post.time}</nome>\n`;
        xml += `    <vitorias>${vitorias || 'N/A'}</vitorias>\n`;
        xml += `    <derrotas>${derrotas || 'N/A'}</derrotas>\n`;
        xml += `    <empates>${empates || 'N/A'}</empates>\n`;
        xml += `    <percentualVitorias>${porcentagemVit || 'N/A'}</percentualVitorias>\n`;
        xml += `  </time>\n`;
    });

    xml += '</times>\n';

    fs.writeFileSync('nfl_classificacao.xml', xml, { encoding: 'utf-8' });
    console.log('Arquivo XML gerado com sucesso!');
}

async function main() {
    const posts = await fetchNFLData();
    if (posts.length > 0) {
        generateXML(posts);
    }
}

main();
