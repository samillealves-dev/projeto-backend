const express = require("express"); 

const router = express.Router(); 

router.get("/", (req,res) => {
    res.send("Servidor backend funcionando");
});

module.exports = router; 