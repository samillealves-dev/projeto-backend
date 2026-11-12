const { Usuario } = require("../../models");
const bcrypt = require("bcrypt");

class UsuarioController {

    static async criar(req, res) {

        try {

            // 1. Receber os dados
            const { firstname, surname, email, password, confirmPassword } = req.body;

            // 2. Verificar campos obrigatórios
            if (!firstname || !surname || !email || !password || !confirmPassword) {
                return res.status(400).json({
                    message: "Todos os campos são obrigatórios."
                });
            }

            // 3. Comparar as senhas
            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "As senhas não coincidem."
                });
            }

            // 4. Consultar se o e-mail existe
            const usuarioExistente = await Usuario.findOne({
                where: {
                    email: email
                }
            });

            // 5. Impedir e-mails duplicados
            if (usuarioExistente) {
                return res.status(400).json({
                    message: "Este e-mail já está cadastrado."
                });
            }

            // 6. Gerar o hash da senha
            const senhaHash = await bcrypt.hash(password, 10);

            // 7. Cadastrar o usuário
            const novoUsuario = await Usuario.create({
                firstname: firstname,
                surname: surname,
                email: email,
                password: senhaHash
            });

            // 8. Responder com sucesso
            return res.status(201).json({
                id: novoUsuario.id,
                firstname: novoUsuario.firstname,
                surname: novoUsuario.surname,
                email: novoUsuario.email
            });

        } catch (error) {

            console.error("Erro ao cadastrar usuário:", error);

            return res.status(500).json({
                message: "Erro interno ao cadastrar usuário."
            });

        }

    } // Fecha o método criar

    static async consultarPorId(req, res) {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            attributes: ["id", "firstname", "surname", "email"]
        });

        if (!usuario) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }

        return res.status(200).json(usuario);

    } catch (error) {
        console.error("Erro ao consultar usuário:", error);

        return res.status(500).json({
            message: "Erro interno ao consultar usuário."
        });
    }
    } // fecha o metodo consultar 

   static async atualizar(req, res) {
    try {
        // 1. Receber o ID pela URL
        const { id } = req.params;

        // 2. Receber os dados que serão atualizados
        const { firstname, surname, email } = req.body;

        // 3. Verificar os campos obrigatórios
        if (!firstname || !surname || !email) {
            return res.status(400).json({
                message: "Todos os campos são obrigatórios."
            });
        }

        // 4. Procurar o usuário no banco
        const usuario = await Usuario.findByPk(id);

        // 5. Verificar se o usuário existe
        if (!usuario) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }

        // 6. Verificar se o e-mail já pertence a outro usuário
        const emailExistente = await Usuario.findOne({
            where: { email: email }
        });

        if (emailExistente && emailExistente.id !== usuario.id) {
            return res.status(400).json({
                message: "Este e-mail já está cadastrado."
            });
        }

        // 7. Atualizar os dados do usuário
        await usuario.update({
            firstname: firstname,
            surname: surname,
            email: email
        });

        // 8. Confirmar a atualização
        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);

        return res.status(500).json({
            message: "Erro interno ao atualizar usuário."
        });
    }
    }

    static async deletar(req, res) {
    try {
        // 1. Receber o ID pela URL
        const { id } = req.params;

        // 2. Procurar o usuário no banco
        const usuario = await Usuario.findByPk(id);

        // 3. Verificar se o usuário existe
        if (!usuario) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }

        // 4. Excluir o usuário
        await usuario.destroy();

        // 5. Confirmar a exclusão
        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao excluir usuário:", error);

        return res.status(500).json({
            message: "Erro interno ao excluir usuário."
        });
    }
    }// fecha a chave deletar

} // Fecha a classe

module.exports = UsuarioController;