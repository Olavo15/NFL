const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function definirCor(progresso) {
    if (progresso < 50) {
        return chalk.red(`${progresso.toFixed(2)}%`);
    } else if (progresso < 100) {
        return chalk.yellow(`${progresso.toFixed(2)}%`);
    } else {
        return chalk.blue(`${progresso.toFixed(2)}%`);
    }
}

async function executarArquivos(arquivos) {
    const totalArquivos = arquivos.length;

    for (let index = 0; index < totalArquivos; index++) {
        const arquivo = arquivos[index];
        const caminhoArquivo = path.join(__dirname, arquivo);

        console.log(` Executando o arquivo: ${caminhoArquivo}\n`);

        try {
            const funcao = require(caminhoArquivo);
            await funcao(); 
        } catch (error) {
            console.log(chalk.red(`Erro ao executar o arquivo: ${arquivo}`), error.message);
            break;
        }

        const progresso = ((index + 1) / totalArquivos) * 100;
        console.log(`Progresso ${definirCor(progresso)}\n`);

        
        await new Promise(resolve => setTimeout(resolve, 4500));
    }

    console.log(chalk.green(`Todos os arquivos foram executados!`));
}


executarArquivos([
    'SpecialTeams/fieldGoals.js',
    'SpecialTeams/kickoffReturns.js',
    'SpecialTeams/kickoffs.js',
    'SpecialTeams/punting.js',
    'SpecialTeams/puntReturns.js',
    'SpecialTeams/scoring.js'
]);
