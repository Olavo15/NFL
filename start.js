const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const pastaDocs = path.join(__dirname, 'Docs');

function criarPasta() {
    if (!fs.existsSync(pastaDocs)) {
        fs.mkdirSync(pastaDocs);
        console.log(chalk.green(`Pasta "Docs" criada.\n`));
    } else {
        console.log(chalk.red(`A pasta "Docs" já existe.\n`));
    }
}

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

        console.log(chalk.red(`Executando o arquivo: ${caminhoArquivo}\n`));

        
        require(caminhoArquivo);

        const progresso = ((index + 1) / totalArquivos) * 100;

        console.log(`Progresso: ${definirCor(progresso)}\n`);
  
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(chalk.green(`Todos os arquivos foram executados!\n`));
}

criarPasta();
executarArquivos([
    'Jogos/jogos.js', 
    'Jogos/tabela.js'
]);
