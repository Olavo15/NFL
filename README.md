# NFL Project

Este é um projeto Node.js chamado `nfl`, que utiliza várias dependências para coletar, manipular e exibir dados relacionados à NFL. O projeto está atualmente na **Fase 1 de teste**, e podem ocorrer mudanças no futuro. Ele coleta dados de estatísticas dos times e ajuda a prever possíveis vencedores.

## Requisitos

Certifique-se de ter instalado o [Node.js](https://nodejs.org/) (versão 14 ou superior) e o npm (Node Package Manager) no seu sistema.

## Instalação

Para configurar o projeto, siga os seguintes passos:

1. Clone este repositório:  
   `git clone https://github.com/Olavo15/NFL.git`

2. Navegue até o diretório do projeto:  
   `cd NFL`

3. Instale as dependências necessárias:  
   `npm install`

## Scripts Disponíveis

O projeto possui uma série de scripts que podem ser executados usando npm. Abaixo estão os comandos disponíveis:

- **Iniciar o projeto:**  
  `npm run start`  
  Este comando executa o arquivo `start.js`.

- **Coletar dados de defesa:**  
  `npm run second`  
  Este comando executa o arquivo `defense.js` e coleta estatísticas sobre a defesa dos times.

- **Coletar dados de ataque:**  
  `npm run third`  
  Este comando executa o arquivo `offense.js` e coleta estatísticas sobre o ataque dos times.

- **Coletar dados de times especiais:**  
  `npm run four`  
  Este comando executa o arquivo `specialTeam.js` e coleta estatísticas sobre os times especiais.

- **Executar testes e análise de dados:**  
  `npm run end`  
  Este comando executa o arquivo `test1.js`, que faz a análise das estatísticas coletadas para prever possíveis resultados dos jogos.

## Dependências

As principais dependências do projeto são:

- **axios:** para realizar requisições HTTP e obter dados de APIs.
- **chalk:** para estilizar e destacar o texto no terminal.
- **cheerio:** para manipulação e análise de HTML.
- **express:** para criar um servidor web que pode ser usado para visualizar dados.
- **puppeteer:** para automação de navegadores e scraping de dados da web.
- **fs:** para manipulação de arquivos no sistema.

Essas dependências são instaladas automaticamente ao executar `npm install`.
