
const { test } = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = "http://localhost:3000";

// TESTE 1 - Rota funcionando corretamente
test("GET / - deve retornar sucesso", async () => {
    const resposta = await fetch(BASE_URL);

    assert.equal(resposta.status, 200);
});

// TESTE 2 - Produto inexistente
test("GET /v1/product/999999 - deve retornar 404", async () => {
    const resposta = await fetch(
        `${BASE_URL}/v1/product/999999`
    );

    assert.equal(resposta.status, 404);

    const dados = await resposta.json();

    assert.equal(
        dados.message,
        "Produto não encontrado."
    );
});
