const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
    // 1. Receber o cabeçalho Authorization
    const authorization = req.headers.authorization;

    // 2. Verificar se o token foi enviado no formato correto
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(400).json({
            message: "Token não informado ou formato inválido."
        });
    }

    // 3. Extrair o token
    const token = authorization.split(" ")[1];

    if (!token) {
        return res.status(400).json({
            message: "Token não informado."
        });
    }

    try {
        // 4. Verificar a assinatura e a validade do token
        const dados = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Guardar os dados do usuário autenticado
        req.usuario = dados;

        // 6. Permitir que a requisição continue
        next();

    } catch (error) {
        return res.status(400).json({
            message: "Token inválido ou expirado."
        });
    }
}

module.exports = autenticarToken;