
'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProdutoCategoria = sequelize.define('ProdutoCategoria', {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Produto',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Categoria',
        key: 'id'
      }
    }
  }, {
    tableName: 'ProdutoCategoria',
    timestamps: false
  });

  return ProdutoCategoria;
};
