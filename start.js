const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const pastaDocs = path.join(__dirname, 'Docs');

function criarPasta() {
    if (!fs.existsSync(pastaDocs)) {
        fs.mkdirSync(pastaDocs);
        console.log('Pasta "Docs" criada.');
    } else {
        console.log('A pasta "Docs" já existe.');
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

        console.log(`Executando o arquivo: ${caminhoArquivo}`);

        
        require(caminhoArquivo);

        const progresso = ((index + 1) / totalArquivos) * 100;

        console.log(`Progresso: ${definirCor(progresso)}`);
  
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(chalk.green(`Todos os arquivos foram executados!\n`));
}

criarPasta();
executarArquivos([
    'Jogos/jogos.js', 
    'Jogos/tabela.js'
]);
