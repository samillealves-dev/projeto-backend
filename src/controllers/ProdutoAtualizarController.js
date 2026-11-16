
const {
    Produto,
    ProdutoCategoria,
    Categoria,
    ImagemProduto,
    OpcaoProduto,
    sequelize
} = require("../../models");

const { Op } = require("sequelize");

class ProdutoAtualizarController {

    static async atualizar(req, res) {
        try {
            const { id } = req.params;

            const {
                enabled,
                name,
                slug,
                stock,
                description,
                price,
                price_with_discount,
                category_ids,
                images,
                options
            } = req.body;

            // Verificar se o produto existe
            const produto = await Produto.findByPk(id);

            if (!produto) {
                return res.status(404).json({
                    message: "Produto não encontrado."
                });
            }

            // Validar os dados principais
            if (
                (name !== undefined &&
                    (typeof name !== "string" || !name.trim())) ||
                (slug !== undefined &&
                    (typeof slug !== "string" || !slug.trim())) ||
                (price !== undefined &&
                    (price === null || price === "" ||
                     !Number.isFinite(Number(price)) ||
                     Number(price) < 0)) ||
                (price_with_discount !== undefined &&
                    (price_with_discount === null ||
                     price_with_discount === "" ||
                     !Number.isFinite(Number(price_with_discount)) ||
                     Number(price_with_discount) < 0)) ||
                (stock !== undefined &&
                    (!Number.isSafeInteger(stock) || stock < 0))
            ) {
                return res.status(400).json({
                    message: "Dados do produto inválidos."
                });
            }

            // Validar categorias
            if (category_ids !== undefined) {
                if (
                    !Array.isArray(category_ids) ||
                    category_ids.some(categoryId =>
                        !Number.isSafeInteger(categoryId) ||
                        categoryId <= 0
                    ) ||
                    new Set(category_ids).size !== category_ids.length
                ) {
                    return res.status(400).json({
                        message: "IDs de categorias inválidos."
                    });
                }

                const quantidade = await Categoria.count({
                    where: {
                        id: { [Op.in]: category_ids }
                    }
                });

                if (quantidade !== category_ids.length) {
                    return res.status(400).json({
                        message: "Uma ou mais categorias não existem."
                    });
                }
            }

            // Validar imagens
            if (images !== undefined) {
                if (!Array.isArray(images)) {
                    return res.status(400).json({
                        message: "O campo images deve ser um array."
                    });
                }

                for (const imagem of images) {
                    if (
                        !imagem ||
                        typeof imagem !== "object" ||
                        Array.isArray(imagem)
                    ) {
                        return res.status(400).json({
                            message: "Imagem inválida."
                        });
                    }

                    if (
                        imagem.id !== undefined &&
                        (!Number.isSafeInteger(imagem.id) || imagem.id <= 0)
                    ) {
                        return res.status(400).json({
                            message: "ID da imagem inválido."
                        });
                    }

                    if (imagem.deleted === true) {
                        if (!imagem.id) {
                            return res.status(400).json({
                                message: "Informe o ID da imagem a excluir."
                            });
                        }
                        continue;
                    }

                    if (
                        typeof imagem.content !== "string" ||
                        !imagem.content.trim()
                    ) {
                        return res.status(400).json({
                            message: "Conteúdo da imagem inválido."
                        });
                    }

                    const conteudo = imagem.content.trim();
                    const ehUrl = /^https?:\/\/\S+$/i.test(conteudo);

                    if (!ehUrl) {
                        const tiposPermitidos = [
                            "image/png",
                            "image/jpeg",
                            "image/jpg"
                        ];

                        if (
                            !tiposPermitidos.includes(imagem.type) ||
                            conteudo.length > 2 * 1024 * 1024 ||
                            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(conteudo)
                        ) {
                            return res.status(400).json({
                                message: "Imagem Base64 inválida."
                            });
                        }
                    }
                }
            }

            // Validar opções
            if (options !== undefined) {
                if (!Array.isArray(options)) {
                    return res.status(400).json({
                        message: "O campo options deve ser um array."
                    });
                }

                for (const opcao of options) {
                    if (
                        !opcao ||
                        typeof opcao !== "object" ||
                        Array.isArray(opcao)
                    ) {
                        return res.status(400).json({
                            message: "Opção inválida."
                        });
                    }

                    if (
                        opcao.id !== undefined &&
                        (!Number.isSafeInteger(opcao.id) || opcao.id <= 0)
                    ) {
                        return res.status(400).json({
                            message: "ID da opção inválido."
                        });
                    }

                    if (opcao.deleted === true) {
                        if (!opcao.id) {
                            return res.status(400).json({
                                message: "Informe o ID da opção a excluir."
                            });
                        }
                        continue;
                    }

                    const valores = opcao.values ?? opcao.value;
                    const raio = opcao.radius;

                    if (
                        (opcao.title !== undefined &&
                            (typeof opcao.title !== "string" ||
                             !opcao.title.trim())) ||
                        (opcao.shape !== undefined &&
                            !["square", "circle"].includes(opcao.shape)) ||
                        (opcao.type !== undefined &&
                            !["text", "color"].includes(opcao.type)) ||
                        (raio !== undefined &&
                            !(
                                (Number.isSafeInteger(raio) && raio >= 0) ||
                                (typeof raio === "string" &&
                                 /^\d+px$/.test(raio))
                            )) ||
                        (valores !== undefined &&
                            (!Array.isArray(valores) ||
                             valores.length === 0 ||
                             valores.some(valor =>
                                 typeof valor !== "string" ||
                                 !valor.trim() ||
                                 valor.includes(",")
                             ))) ||
                        (!opcao.id &&
                            (typeof opcao.title !== "string" ||
                             !opcao.title.trim() ||
                             valores === undefined))
                    ) {
                        return res.status(400).json({
                            message: "Dados da opção inválidos."
                        });
                    }
                }
            }

            // Atualizar todos os dados em uma transação
            await sequelize.transaction(async transaction => {

                // Atualizar produto
                const dados = {};

                if (enabled !== undefined) dados.enabled = enabled;
                if (name !== undefined) dados.name = name.trim();
                if (slug !== undefined) dados.slug = slug.trim();
                if (stock !== undefined) dados.stock = stock;
                if (description !== undefined) dados.description = description;
                if (price !== undefined) dados.price = Number(price);
                if (price_with_discount !== undefined) {
                    dados.price_with_discount = Number(price_with_discount);
                }

                await produto.update(dados, { transaction });

                // Substituir associações de categorias
                if (category_ids !== undefined) {
                    await ProdutoCategoria.destroy({
                        where: { product_id: produto.id },
                        transaction
                    });

                    if (category_ids.length > 0) {
                        await ProdutoCategoria.bulkCreate(
                            category_ids.map(categoryId => ({
                                product_id: produto.id,
                                category_id: categoryId
                            })),
                            { transaction }
                        );
                    }
                }

                // Atualizar, excluir ou criar imagens
                if (images !== undefined) {
                    for (const imagem of images) {

                        if (imagem.id) {
                            const existente = await ImagemProduto.findOne({
                                where: {
                                    id: imagem.id,
                                    product_id: produto.id
                                },
                                transaction
                            });

                            if (!existente) {
                                const erro = new Error("Imagem não encontrada.");
                                erro.status = 400;
                                throw erro;
                            }

                            if (imagem.deleted === true) {
                                await existente.destroy({ transaction });
                            } else {
                                const conteudo = imagem.content.trim();
                                const path = /^https?:\/\//i.test(conteudo)
                                    ? conteudo
                                    : `data:${imagem.type};base64,${conteudo}`;

                                await existente.update({ path }, { transaction });
                            }

                        } else {
                            const conteudo = imagem.content.trim();
                            const path = /^https?:\/\//i.test(conteudo)
                                ? conteudo
                                : `data:${imagem.type};base64,${conteudo}`;

                            await ImagemProduto.create({
                                product_id: produto.id,
                                enabled: true,
                                path
                            }, { transaction });
                        }
                    }
                }

                // Atualizar, excluir ou criar opções
                if (options !== undefined) {
                    for (const opcao of options) {

                        let existente = null;

                        if (opcao.id) {
                            existente = await OpcaoProduto.findOne({
                                where: {
                                    id: opcao.id,
                                    product_id: produto.id
                                },
                                transaction
                            });

                            if (!existente) {
                                const erro = new Error("Opção não encontrada.");
                                erro.status = 400;
                                throw erro;
                            }
                        }

                        if (opcao.deleted === true) {
                            await existente.destroy({ transaction });
                            continue;
                        }

                        const dadosOpcao = {};

                        if (opcao.title !== undefined) {
                            dadosOpcao.title = opcao.title.trim();
                        }

                        if (opcao.shape !== undefined) {
                            dadosOpcao.shape = opcao.shape;
                        }

                        if (opcao.type !== undefined) {
                            dadosOpcao.type = opcao.type;
                        }

                        if (opcao.radius !== undefined) {
                            dadosOpcao.radius =
                                typeof opcao.radius === "string"
                                    ? Number(opcao.radius.replace("px", ""))
                                    : opcao.radius;
                        }

                        const valores = opcao.values ?? opcao.value;

                        if (valores !== undefined) {
                            dadosOpcao.values = valores
                                .map(valor => valor.trim())
                                .join(",");
                        }

                        if (existente) {
                            await existente.update(dadosOpcao, { transaction });
                        } else {
                            await OpcaoProduto.create({
                                product_id: produto.id,
                                title: dadosOpcao.title,
                                shape: dadosOpcao.shape ?? "square",
                                radius: dadosOpcao.radius ?? 0,
                                type: dadosOpcao.type ?? "text",
                                values: dadosOpcao.values
                            }, { transaction });
                        }
                    }
                }
            });

            return res.status(204).send();

        } catch (error) {
            console.error("Erro ao atualizar produto:", error);

            if (error.status === 400) {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: "Erro interno ao atualizar produto."
            });
        }
    }
}

module.exports = ProdutoAtualizarController;
