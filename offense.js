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

        console.log(chalk.blueBright(`Executando o arquivo: ${caminhoArquivo}\n`));

        try {
            const funcao = require(caminhoArquivo);
            await funcao(); 
        } catch (error) {
            console.log(chalk.red(`Erro ao executar o arquivo: ${arquivo}`), error.message);
            break;
        }

        const progresso = ((index + 1) / totalArquivos) * 100;
        console.log(chalk.blueBright(`Progresso ${definirCor(progresso)}\n`));

        
        await new Promise(resolve => setTimeout(resolve, 3500));
    }

    console.log(chalk.green(`Todos os arquivos foram executados!`));
}


executarArquivos([
    'Offense/downs.js',
    'Offense/passing.js',
    'Offense/receiving.js',
    'Offense/rushing.js',
    'Offense/scoring.js',
]);