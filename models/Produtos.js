'use strict';

module.exports = (sequelize, DataTypes) => {
  const Produto = sequelize.define('Produto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    use_in_menu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    description: {
      type: DataTypes.STRING
    },
    preco: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    price_with_discount: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'Produto',
    timestamps: true,
    createdAt: 'criadas_at',
    updatedAt: 'atualizadas_at'
  });

  // Relacionamentos do produto
  Produto.associate = (models) => {
    // Um produto pode ter várias imagens
    Produto.hasMany(models.ImagemProduto, {
      foreignKey: 'product_id'
    });

    // Um produto pode ter várias opções
    Produto.hasMany(models.OpcaoProduto, {
      foreignKey: 'product_id'
    });

    // Um produto pode pertencer a várias categorias
    Produto.belongsToMany(models.Categoria, {
      through: models.ProdutoCategoria,
      foreignKey: 'product_id',
      otherKey: 'category_id'
    });
  };

  return Produto;
};