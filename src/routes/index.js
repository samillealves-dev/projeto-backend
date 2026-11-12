const express = require("express");
const UsuarioController = require("../controllers/UsuarioController");


const router = express.Router();

// Rota para verificar o servidor
router.get("/", (req, res) => {
    res.send("Servidor backend funcionando");
});

// Rota para cadastrar usuários
router.post("/v1/user", UsuarioController.criar);
router.get("/v1/user/:id", UsuarioController.consultarPorId);
router.put("/v1/user/:id", UsuarioController.atualizar);
router.delete("/v1/user/:id", UsuarioController.deletar);

module.exports = router;