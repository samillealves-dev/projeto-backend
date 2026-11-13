
const { Categoria } = require("../../models");

class CategoriaController {

    // MÉTODO POST - CADASTRAR CATEGORIA
    static async criar(req, res) {
        try {
            // 1. Receber os dados enviados pelo cliente
            const { name, slug, use_in_menu } = req.body;

            // 2. Validar os campos obrigatórios
            if (
                typeof name !== "string" || !name.trim() ||
                typeof slug !== "string" || !slug.trim() ||
                typeof use_in_menu !== "boolean"
            ) {
                return res.status(400).json({
                    message: "Dados da categoria inválidos ou incompletos."
                });
            }

            // 3. Cadastrar a categoria no banco de dados
            const novaCategoria = await Categoria.create({
                name: name.trim(),
                slug: slug.trim(),
                use_in_menu: use_in_menu
            });

            // 4. Retornar sucesso
            return res.status(201).json({
                id: novaCategoria.id,
                name: novaCategoria.name,
                slug: novaCategoria.slug,
                use_in_menu: novaCategoria.use_in_menu
            });

        } catch (error) {
            console.error("Erro ao cadastrar categoria:", error);

            return res.status(500).json({
                message: "Erro interno ao cadastrar categoria."
            });
        }
    } // Fecha o método criar


    // MÉTODO GET - CONSULTAR CATEGORIA POR ID
    static async consultarPorId(req, res) {
        try {
            // 1. Receber o ID pela URL
            const { id } = req.params;

            // 2. Procurar a categoria no banco
            const categoria = await Categoria.findByPk(id, {
                attributes: ["id", "name", "slug", "use_in_menu"]
            });

            // 3. Verificar se a categoria existe
            if (!categoria) {
                return res.status(404).json({
                    message: "Categoria não encontrada."
                });
            }

            // 4. Retornar os dados da categoria
            return res.status(200).json(categoria);

        } catch (error) {
            console.error("Erro ao consultar categoria:", error);

            return res.status(500).json({
                message: "Erro interno ao consultar categoria."
            });
        }
    } // Fecha o método consultarPorId


    // MÉTODO GET - LISTAR CATEGORIAS
    static async listar(req, res) {
        try {
            // 1. Receber os parâmetros da URL
            const {
                limit = "12",
                page = "1",
                fields,
                use_in_menu
            } = req.query;

            // 2. Converter e validar a paginação
            const limite = Number(limit);
            const pagina = Number(page);

            if (
                !Number.isInteger(limite) ||
                (limite !== -1 && limite < 1) ||
                !Number.isInteger(pagina) ||
                pagina < 1
            ) {
                return res.status(400).json({
                    message: "Parâmetros de paginação inválidos."
                });
            }

            // 3. Definir os campos retornados
            const camposPermitidos = [
                "id",
                "name",
                "slug",
                "use_in_menu"
            ];

            let atributos = camposPermitidos;

            if (fields !== undefined) {
                if (typeof fields !== "string") {
                    return res.status(400).json({
                        message: "Parâmetro fields inválido."
                    });
                }

                const camposSolicitados = fields
                    .split(",")
                    .map(campo => campo.trim());

                if (
                    camposSolicitados.some(
                        campo => !camposPermitidos.includes(campo)
                    )
                ) {
                    return res.status(400).json({
                        message: "Um ou mais campos solicitados são inválidos."
                    });
                }

                atributos = [...new Set(["id", ...camposSolicitados])];
            }

            // 4. Preparar o filtro do menu
            const where = {};

            if (use_in_menu !== undefined) {
                if (
                    use_in_menu !== "true" &&
                    use_in_menu !== "false"
                ) {
                    return res.status(400).json({
                        message: "Parâmetro use_in_menu inválido."
                    });
                }

                where.use_in_menu = use_in_menu === "true";
            }

            // 5. Montar a consulta ao banco
            const opcoes = {
                where: where,
                attributes: atributos,
                order: [["id", "ASC"]]
            };

            // 6. Aplicar paginação, exceto quando limit = -1
            if (limite !== -1) {
                opcoes.limit = limite;
                opcoes.offset = (pagina - 1) * limite;
            }

            // 7. Consultar as categorias e a quantidade total
            const resultado = await Categoria.findAndCountAll(opcoes);

            // 8. Retornar os dados
            return res.status(200).json({
                data: resultado.rows,
                total: resultado.count,
                limit: limite,
                page: limite === -1 ? 1 : pagina
            });

        } catch (error) {
            console.error("Erro ao listar categorias:", error);

            return res.status(500).json({
                message: "Erro interno ao listar categorias."
            });
        }
    } // Fecha o método listar
    
    // MÉTODO PUT - ATUALIZAR CATEGORIA
    static async atualizar(req, res) {
        try {
            // 1. Receber o ID e os dados
            const { id } = req.params;
            const { name, slug, use_in_menu } = req.body;

            // 2. Validar os dados recebidos
            if (
                typeof name !== "string" || !name.trim() ||
                typeof slug !== "string" || !slug.trim() ||
                typeof use_in_menu !== "boolean"
            ) {
                return res.status(400).json({
                message: "Dados da categoria inválidos ou incompletos."
            });
            }

            // 3. Procurar a categoria pelo ID
            const categoria = await Categoria.findByPk(id);

            if (!categoria) {
                return res.status(404).json({
                message: "Categoria não encontrada."
            });
            }

            // 4. Atualizar os dados no MySQL
            await categoria.update({
            name: name.trim(),
            slug: slug.trim(),
            use_in_menu: use_in_menu
            });

            // 5. Retornar sucesso sem corpo
            return res.status(204).send();

        } catch (error) {
        console.error("Erro ao atualizar categoria:", error);

            return res.status(500).json({
                message: "Erro interno ao atualizar categoria."
             });
        }
    }// fecha o atualizar 
    
    
        // MÉTODO DELETE - EXCLUIR CATEGORIA
    static async excluir(req, res) {
        try {
            // 1. Receber o ID pela URL
            const { id } = req.params;

            // 2. Procurar a categoria no banco
            const categoria = await Categoria.findByPk(id);

            // 3. Verificar se a categoria existe
            if (!categoria) {
                return res.status(404).json({
                    message: "Categoria não encontrada."
                });
            }

            // 4. Excluir a categoria do banco
            await categoria.destroy();

            // 5. Retornar sucesso sem corpo
            return res.status(204).send();

        } catch (error) {
            console.error("Erro ao excluir categoria:", error);

            return res.status(500).json({
                message: "Erro interno ao excluir categoria."
            });
        }
    } // Fecha o método excluir

} // Fecha a classe CategoriaController

module.exports = CategoriaController;
