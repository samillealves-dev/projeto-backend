# Projeto Back-end — API REST

Projeto desenvolvido como atividade final do módulo Back-end da formação Full Stack da Digital College.

A aplicação é uma API REST desenvolvida com Node.js e Express, utilizando MySQL como banco de dados e Sequelize como ORM.

## Tecnologias utilizadas

- Node.js
- Express
- MySQL
- Sequelize e Sequelize
- JWT (JSON We CLIb Token)
- bcrypt
- dotenv
- Nodemon

## Funcionalidades

A API possui:

- Cadastro, consulta, atualização e exclusão de usuários.
- Autenticação de usuários utilizando JWT.
- Cadastro, consulta, atualização e exclusão de categorias.
- Cadastro, consulta, atualização e exclusão de produtos.
- Associação de produtos a categorias, imagens e opções.
- Consulta de produtos por identificador e filtros de pesquisa.

## Configuração do banco de dados

**Atenção:** O nome do banco utilizado neste projeto é `projeto_backend`, diferente do nome sugerido no enunciado (`dropstore`).

O banco deve ser criado no MySQL com o nome:

```sql
CREATE DATABASE projeto_backend;
```

As tabelas são gerenciadas por migrations do Sequelize.

## Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/samillealves-dev/projeto-backend.git
cd projeto-backend
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, com a seguinte estrutura:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=projeto_backend
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
JWT_SECRET=sua_chave_secreta
```

Substitua os valores de exemplo pelas configurações do seu ambiente.

### 4. Executar as migrations

Com o MySQL em funcionamento e o banco criado, execute:

```bash
npx sequelize-cli db:migrate
```

### 5. Iniciar o servidor

```bash
npm start
```

Ou execute diretamente:

```bash
node src/server.js
```

A API estará disponível em:

`http://localhost:3000`

## Testes automatizados

O projeto contém dois testes automatizados utilizando o módulo nativo de testes do Node.js:

- `GET /` — verifica se a API responde com status HTTP 200.
- `GET /v1/product/999999` — verifica o retorno HTTP 404 para um produto inexistente.

Com o servidor em execução em um terminal, abra outro terminal e execute:

```bash
npm test
```

Os dois testes foram executados e aprovados durante o desenvolvimento.

## Estrutura do projeto

O projeto utiliza uma organização com rotas, controllers, models e configurações de banco de dados.

As migrations são responsáveis pela criação e manutenção da estrutura das tabelas.

## Repositório

[https://github.com/samillealves-dev/projeto-backend](https://github.com/samillealves-dev/projeto-backend)
