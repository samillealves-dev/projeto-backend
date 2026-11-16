const express = require("express");
const UsuarioController = require("../controllers/UsuarioController");
const CategoriaController = require("../controllers/CategoriaController");
const autenticarToken = require("../middlewares/autenticarToken");
const ProdutoController = require("../controllers/ProdutoController");
const ProdutoAtualizarController = require("../controllers/ProdutoAtualizarController");
const ProdutoDeletarController = require("../controllers/ProdutoDeletarController");


const router = express.Router();

// Rota para verificar o servidor
router.get("/", (req, res) => {
    res.send("Servidor backend funcionando");
});

// Rota para cadastrar usuários
router.post("/v1/user", UsuarioController.criar);
router.post("/v1/user/token", UsuarioController.gerarToken);
router.get("/v1/user/:id", UsuarioController.consultarPorId);
router.put("/v1/user/:id", autenticarToken, UsuarioController.atualizar);
router.delete("/v1/user/:id", autenticarToken, UsuarioController.deletar);


// ROTAS DE CATEGORIAS
router.post("/v1/category", autenticarToken, CategoriaController.criar);
router.get("/v1/category/search", CategoriaController.listar);
router.get("/v1/category/:id", CategoriaController.consultarPorId);
router.put("/v1/category/:id", autenticarToken, CategoriaController.atualizar);
router.delete("/v1/category/:id", autenticarToken, CategoriaController.excluir);

// Rotas de produtos
router.get("/v1/product/search", ProdutoController.listar);
router.get("/v1/product/:id", ProdutoController.consultarPorId);
router.post("/v1/product", autenticarToken, ProdutoController.criar);
router.put("/v1/product/:id", autenticarToken, ProdutoAtualizarController.atualizar);
router.delete("/v1/product/:id", autenticarToken, ProdutoDeletarController.deletar);





module.exports = router;