
const {
    Produto,
    ProdutoCategoria,
    ImagemProduto,
    OpcaoProduto,
    sequelize
} = require("../../models");

class ProdutoDeletarController {

    static async deletar(req, res) {
        try {
            const { id } = req.params;

            const produto = await Produto.findByPk(id);

            if (!produto) {
                return res.status(404).json({
                    message: "Produto não encontrado."
                });
            }

            await sequelize.transaction(async transaction => {

                await ProdutoCategoria.destroy({
                    where: { product_id: produto.id },
                    transaction
                });

                await ImagemProduto.destroy({
                    where: { product_id: produto.id },
                    transaction
                });

                await OpcaoProduto.destroy({
                    where: { product_id: produto.id },
                    transaction
                });

                await produto.destroy({ transaction });
            });

            return res.status(204).send();

        } catch (error) {
            console.error("Erro ao excluir produto:", error);

            return res.status(500).json({
                message: "Erro interno ao excluir produto."
            });
        }
    }
}

module.exports = ProdutoDeletarController;
