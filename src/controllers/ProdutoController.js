
const {
    Produto,
    ProdutoCategoria,
    Categoria,
    ImagemProduto,
    OpcaoProduto,
    sequelize
} = require("../../models");

const { Op } = require("sequelize");

class ProdutoController {

    // GET - CONSULTAR PRODUTO POR ID
    static async consultarPorId(req, res) {
        try {
            const { id } = req.params;

            const produto = await Produto.findByPk(id, {
                include: [
                    { association: "ImagemProdutos" },
                    { association: "OpcaoProdutos" },
                    {
                        association: "Categoria",
                        through: { attributes: [] }
                    }
                ]
            });

            if (!produto) {
                return res.status(404).json({
                    message: "Produto não encontrado."
                });
            }

            const resposta = {
                id: produto.id,
                enabled: produto.enabled,
                name: produto.name,
                slug: produto.slug,
                stock: produto.stock,
                description: produto.description,
                price: produto.price,
                price_with_discount: produto.price_with_discount,

                category_ids: produto.Categoria.map(
                    categoria => categoria.id
                ),

                images: produto.ImagemProdutos.map(imagem => ({
                    id: imagem.id,
                    content: imagem.path
                })),

                options: produto.OpcaoProdutos.map(opcao => ({
                    id: opcao.id,
                    title: opcao.title,
                    shape: opcao.shape,
                    radius: opcao.radius,
                    type: opcao.type,
                    values: opcao.values
                }))
            };

            return res.status(200).json(resposta);

        } catch (error) {
            console.error("Erro ao consultar produto:", error);

            return res.status(500).json({
                message: "Erro interno ao consultar produto."
            });
        }
    }

    // GET - LISTAR PRODUTOS
    static async listar(req, res) {
        try {
            const {
                limit = "12",
                page = "1",
                fields,
                match,
                category_ids,
                "price-range": priceRange
            } = req.query;

            const limite = Number(limit);
            const pagina = Number(page);

            if (
                !Number.isInteger(limite) ||
                (limite !== -1 && limite < 1) ||
                (limite !== -1 && (
                    !Number.isInteger(pagina) ||
                    pagina < 1
                ))
            ) {
                return res.status(400).json({
                    message: "Parâmetros de paginação inválidos."
                });
            }

            const camposPermitidos = [
                "id",
                "enabled",
                "name",
                "slug",
                "stock",
                "description",
                "price",
                "price_with_discount",
                "category_ids",
                "images",
                "options"
            ];

            let camposSelecionados = camposPermitidos;

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

                camposSelecionados = [
                    ...new Set(["id", ...camposSolicitados])
                ];
            }

            const where = {};

            // Filtro por nome ou descrição
            if (match !== undefined) {
                if (
                    typeof match !== "string" ||
                    !match.trim()
                ) {
                    return res.status(400).json({
                        message: "Parâmetro match inválido."
                    });
                }

                where[Op.or] = [
                    {
                        name: {
                            [Op.like]: `%${match.trim()}%`
                        }
                    },
                    {
                        description: {
                            [Op.like]: `%${match.trim()}%`
                        }
                    }
                ];
            }

            // Filtro por faixa de preço
            if (priceRange !== undefined) {
                if (typeof priceRange !== "string") {
                    return res.status(400).json({
                        message: "Parâmetro price-range inválido."
                    });
                }

                const valores = priceRange.split("-");

                if (
                    valores.length !== 2 ||
                    valores.some(valor =>
                        !valor.trim() ||
                        !Number.isFinite(Number(valor))
                    ) ||
                    Number(valores[0]) < 0 ||
                    Number(valores[1]) < Number(valores[0])
                ) {
                    return res.status(400).json({
                        message: "Faixa de preços inválida."
                    });
                }

                where.price = {
                    [Op.between]: [
                        Number(valores[0]),
                        Number(valores[1])
                    ]
                };
            }

            // Filtro por categorias
            let categoriasFiltro = [];

            if (category_ids !== undefined) {
                if (typeof category_ids !== "string") {
                    return res.status(400).json({
                        message: "Parâmetro category_ids inválido."
                    });
                }

                const ids = category_ids.split(",");

                if (
                    ids.some(id =>
                        !/^[1-9]\d*$/.test(id.trim())
                    )
                ) {
                    return res.status(400).json({
                        message: "IDs de categorias inválidos."
                    });
                }

                categoriasFiltro = ids.map(
                    id => Number(id.trim())
                );
            }

            const opcoes = {
                where,
                include: [
                    { association: "ImagemProdutos" },
                    { association: "OpcaoProdutos" },
                    {
                        association: "Categoria",
                        through: { attributes: [] }
                    }
                ],
                distinct: true,
                order: [["id", "ASC"]]
            };

            if (categoriasFiltro.length > 0) {
                const associacoes = await ProdutoCategoria.findAll({
                    where: {
                        category_id: {
                            [Op.in]: categoriasFiltro
                        }
                    },
                    attributes: ["product_id"]
                });

                const idsProdutos = associacoes.map(
                    associacao => associacao.product_id
                );

                opcoes.where.id = {
                    [Op.in]: idsProdutos
                };
            }

            // Filtro por opções: option[1]=M
            const filtrosOpcoes = Object.entries(req.query)
                .filter(([chave]) => /^option\[\d+\]$/.test(chave));

            if (filtrosOpcoes.length > 0) {
                for (const [chave, valor] of filtrosOpcoes) {
                    const idOpcao = Number(chave.match(/\d+/)[0]);

                    if (
                        !Number.isSafeInteger(idOpcao) ||
                        idOpcao < 1 ||
                        typeof valor !== "string" ||
                        valor.split(",").some(item => !item.trim())
                    ) {
                        return res.status(400).json({
                            message: "Filtro de opções inválido."
                        });
                    }

                    const valoresSolicitados = valor
                        .split(",")
                        .map(item => item.trim());

                    const opcoesEncontradas = await OpcaoProduto.findAll({
                        where: { id: idOpcao },
                        attributes: ["product_id", "values"]
                    });

                    const idsProdutos = opcoesEncontradas
                        .filter(opcao => {
                            const valoresDisponiveis = String(opcao.values)
                                .split(",")
                                .map(item => item.trim());

                            return valoresSolicitados.some(valor =>
                                valoresDisponiveis.includes(valor)
                            );
                        })
                        .map(opcao => opcao.product_id);

                    if (opcoes.where.id) {
                        const idsAnteriores = opcoes.where.id[Op.in];

                        opcoes.where.id = {
                            [Op.in]: idsAnteriores.filter(id =>
                                idsProdutos.includes(id)
                            )
                        };
                    } else {
                        opcoes.where.id = {
                            [Op.in]: idsProdutos
                        };
                    }
                }
            }

            // Paginação
            if (limite !== -1) {
                opcoes.limit = limite;
                opcoes.offset = (pagina - 1) * limite;
            }

            const resultado = await Produto.findAndCountAll(opcoes);

            const produtos = resultado.rows.map(produto => {
                const dados = {
                    id: produto.id,
                    enabled: produto.enabled,
                    name: produto.name,
                    slug: produto.slug,
                    stock: produto.stock,
                    description: produto.description,
                    price: produto.price,
                    price_with_discount: produto.price_with_discount,

                    category_ids: produto.Categoria.map(
                        categoria => categoria.id
                    ),

                    images: produto.ImagemProdutos.map(imagem => ({
                        id: imagem.id,
                        content: imagem.path
                    })),

                    options: produto.OpcaoProdutos.map(opcao => ({
                        id: opcao.id,
                        title: opcao.title,
                        shape: opcao.shape,
                        radius: opcao.radius,
                        type: opcao.type,
                        values: opcao.values
                    }))
                };

                return Object.fromEntries(
                    Object.entries(dados).filter(
                        ([campo]) => camposSelecionados.includes(campo)
                    )
                );
            });

            return res.status(200).json({
                data: produtos,
                total: resultado.count,
                limit: limite,
                page: limite === -1 ? 1 : pagina
            });

        } catch (error) {
            console.error("Erro ao listar produtos:", error);

            return res.status(500).json({
                message: "Erro interno ao listar produtos."
            });
        }
    }

    // POST - CRIAR PRODUTO
    static async criar(req, res) {
        try {
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

            // Validar os dados obrigatórios
            if (
                typeof name !== "string" ||
                !name.trim() ||
                typeof slug !== "string" ||
                !slug.trim() ||
                price === undefined ||
                price === null ||
                price === "" ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0
            ) {
                return res.status(400).json({
                    message: "Dados obrigatórios do produto inválidos."
                });
            }

            // Validar categorias
            if (
                category_ids !== undefined &&
                (
                    !Array.isArray(category_ids) ||
                    category_ids.some(id =>
                        !Number.isSafeInteger(id) || id <= 0
                    ) ||
                    new Set(category_ids).size !== category_ids.length
                )
            ) {
                return res.status(400).json({
                    message: "IDs de categorias inválidos."
                });
            }

            if (category_ids && category_ids.length > 0) {
                const quantidadeCategorias = await Categoria.count({
                    where: {
                        id: {
                            [Op.in]: category_ids
                        }
                    }
                });

                if (quantidadeCategorias !== category_ids.length) {
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

                const imagemInvalida = images.some(imagem => {
                    if (
                        !imagem ||
                        typeof imagem !== "object" ||
                        Array.isArray(imagem)
                    ) {
                        return true;
                    }

                    const tiposPermitidos = [
                        "image/png",
                        "image/jpeg",
                        "image/jpg"
                    ];

                    if (!tiposPermitidos.includes(imagem.type)) {
                        return true;
                    }

                    if (
                        typeof imagem.content !== "string" ||
                        !imagem.content.trim()
                    ) {
                        return true;
                    }

                    const base64 = imagem.content.trim();

                    return (
                        base64.length > 2 * 1024 * 1024 ||
                        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)
                    );
                });

                if (imagemInvalida) {
                    return res.status(400).json({
                        message: "Uma ou mais imagens são inválidas."
                    });
                }
            }

            // Validar opções
            if (options !== undefined) {
                if (!Array.isArray(options)) {
                    return res.status(400).json({
                        message: "O campo options deve ser um array."
                    });
                }

                const opcaoInvalida = options.some(opcao => {
                    if (
                        !opcao ||
                        typeof opcao !== "object" ||
                        Array.isArray(opcao)
                    ) {
                        return true;
                    }

                    const valores = opcao.values ?? opcao.value;
                    const raio = opcao.radius ?? 0;

                    const raioNumero =
                        typeof raio === "string" && /^\d+px$/.test(raio)
                            ? Number(raio.slice(0, -2))
                            : raio;

                    return (
                        typeof opcao.title !== "string" ||
                        !opcao.title.trim() ||
                        !["square", "circle"].includes(
                            opcao.shape ?? "square"
                        ) ||
                        !["text", "color"].includes(
                            opcao.type ?? "text"
                        ) ||
                        !Number.isSafeInteger(raioNumero) ||
                        raioNumero < 0 ||
                        !Array.isArray(valores) ||
                        valores.length === 0 ||
                        valores.some(valor =>
                            typeof valor !== "string" ||
                            !valor.trim() ||
                            valor.includes(",")
                        )
                    );
                });

                if (opcaoInvalida) {
                    return res.status(400).json({
                        message: "Uma ou mais opções são inválidas."
                    });
                }
            }

            // Salvar tudo em uma única transação
            const novoProduto = await sequelize.transaction(
                async (transaction) => {

                    // Criar produto
                    const produto = await Produto.create({
                        enabled: enabled ?? false,
                        name: name.trim(),
                        slug: slug.trim(),
                        stock: stock ?? 0,
                        description: description ?? null,
                        price: Number(price),
                        price_with_discount:
                            price_with_discount ?? Number(price)
                    }, { transaction });

                    // Associar categorias
                    if (category_ids && category_ids.length > 0) {
                        const associacoes = category_ids.map(
                            categoryId => ({
                                product_id: produto.id,
                                category_id: categoryId
                            })
                        );

                        await ProdutoCategoria.bulkCreate(
                            associacoes,
                            { transaction }
                        );
                    }

                    // Cadastrar imagens
                    if (images && images.length > 0) {
                        const imagensParaSalvar = images.map(imagem => ({
                            product_id: produto.id,
                            enabled: true,
                            path: `data:${imagem.type};base64,${imagem.content.trim()}`
                        }));

                        await ImagemProduto.bulkCreate(
                            imagensParaSalvar,
                            { transaction }
                        );
                    }

                    // Cadastrar opções
                    if (options && options.length > 0) {
                        const opcoesParaSalvar = options.map(opcao => {
                            const valores = opcao.values ?? opcao.value;
                            const raio = opcao.radius ?? 0;

                            return {
                                product_id: produto.id,
                                title: opcao.title.trim(),
                                shape: opcao.shape ?? "square",
                                radius: typeof raio === "string"
                                    ? Number(raio.replace("px", ""))
                                    : raio,
                                type: opcao.type ?? "text",
                                values: valores
                                    .map(valor => valor.trim())
                                    .join(",")
                            };
                        });

                        await OpcaoProduto.bulkCreate(
                            opcoesParaSalvar,
                            { transaction }
                        );
                    }

                    return produto;
                }
            );

            return res.status(201).json({
                id: novoProduto.id,
                message: "Produto cadastrado com sucesso."
            });

        } catch (error) {
            console.error("Erro ao criar produto:", error);

            return res.status(500).json({
                message: "Erro interno ao criar produto."
            });
        }
    }
}

module.exports = ProdutoController;
