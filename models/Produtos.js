
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
    name: {
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
    price: {
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
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Relacionamentos do produto
  Produto.associate = (models) => {
    Produto.hasMany(models.ImagemProduto, {
      foreignKey: 'product_id'
    });

    Produto.hasMany(models.OpcaoProduto, {
      foreignKey: 'product_id'
    });

    Produto.belongsToMany(models.Categoria, {
      through: models.ProdutoCategoria,
      foreignKey: 'product_id',
      otherKey: 'category_id'
    });
  };

  return Produto;
};
