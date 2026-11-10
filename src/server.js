const express = require("express");
const routes = require("./routes");

const host = "localhost"
const port = 3000;

const app = express();

// Permite receber dados JSON
app.use(express.json());

// Registra as rotas da aplicação
app.use(routes);

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor executando em http://${host}:${port}`);
});