comandos
prisma generate

*** iniciar projeto
já esta configurado no package.json só rodar o comando:
npm start



/*
  sobre a endpoint do graphQl, poderia sim trabalhar diretamente com ela
  porém ficaria exporto todo o banco de dados, por isso foi criado um serviço somente para 
  a api e garantir a segurança.

  foi usado o graphql-yoga para fazer o intermediario entre api node e prisma
*/


************* Configurando a aplicação no conteiner do docker *************

primeira coisa a se fazer é criar um arquivo

"Dockerfile" onde será configurado o container da aplicação

na opção "FROM" será setado um valor para indicar qual a imagem do S.O utilizado no contenteiner
esse mini-sistema operacional será um linux na versão alpine, uma versão simple que
contém apenas o necessário instalado e contém 5mb de tamanho
node:10.15.3-alpine

essa outra opção configurada para indicar o diretório dentro do container que será utilizada para armazenar
os arquivos da aplicação:

WORKDIR  /usr/app

esse comando é para pegar todos os arquivos que começa com "package" e termine com ".json" e copia para o
a pasta "usr/app", diretório configurado acima.

COPY package*.json ./
(só para agregar conhencimento, tudo que é indicado a esquerda 
referece se a maquina local e a direita será referenciado o container do docker)

rodar o comando para instalar as dependencias do package.json que foi copiado para o container

depois de instalar as dependencias
copiar os arquivos restantes

COPY . . 

como já foi copiado o package.json e instalados as dependencias, não é necessário copiar esses arquivos do local
então para que não seja copiado, é necessário criar um arquivo com o nome  .dockerignore e dentro desse arquivo 
referenciar o node_modules assim como é feito no github


após realizado a configuração é necessário também expor a porta de acesso para a máquina local 
através do comando:

EXPORT  4000

e por fim será preciso rodar o CMD um comando único por dockerfiler para indicar qual o comando responsável para
subir a aplicação :

CMD ["npm", "start"]


****************************************************************************************************

configurando o docker-composer.yml para rodar a aplicação

no services será necessário adicionar os seguintes itens:

   api: 
    build: .
    ports: 
      - "4000:4000" /* por esse motivo aqui, não é necessário o comando EXPORT NO dockerfile, será mantido apenas para deixar explicido */
    command: npm start /* da mesma forma esse comando */



Bom...
Agora basta apenas rodar esse comando no terminal para instalar as configurações necessárias, assim como baixar a ISO e rodar o 
docker.

docker-compose up -d


Ótimo! agora o prisma server estará rodando dentro de um container docker
porém será apresentado um pequeno problema, o graphQl e o graphYoga estará rodando normalmente,
mas o prisma-client apresenta um erro ao tentar conectar ao postegrees pois ainda esta tentando se conectar ao localhost:4466
(nesta aplicação em expecífico) 

para corrigir isso será necessário então criar variáveis de hambiente onde será criado o arquivo chamado ".env" para essa configuração
esse arquivo deve ser seguro e irá conter segredos por isso é importante registrá-lo no gitignore e no dockerignore

será criado então a váriavel com o valor:
PRIMAS_ENDPOINT-http://localhost:4466

altera o valor do endpoint do arquivo prisma/prisma.yml para :
${env:PRIMAS_ENDPOINT}

Bom agora configura o docker-compose.yml para que quando subir o docker alterar essa variável de ambiente.
Basta então adicionar abaixo do campo ports o seguiqnte código:

environment: 
      PRISMA_ENDPOINT: htpp://prisma:4466

então para rodar novamente e atualizar a api basta então rodar o código 
docker-compose up -d --build --no-deps api


volumes : 
      - .:/usr/app
sempre que houver uma atualização ele recopiado para o container 

nodemom, uma dependencia de desenvolvimento para reistartar o servido no container
instalar
npm i -D -E nodemon@1.18.10

criar no package.json um script para rodar o nodemon
  "dev" : "npx nodemon --delay 1000ms --ext js,graphql src/index.js"
  * o ext, serve para expecificar as extensões que o nodemon também deve considerar

instalação do prisma -binding
  npm i -E prisma-binding@~2.3

documentação para entender melhor do que se trata:
  https://github.com/prisma-labs/prisma-binding

comparação entre o prisma client e binding  
  https://www.prisma.io/docs/1.24/faq/prisma-client-vs-prisma-bindings-fq06/




