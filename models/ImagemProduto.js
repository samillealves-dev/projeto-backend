
'use strict';

module.exports = (sequelize, DataTypes) => {
  const ImagemProduto = sequelize.define('ImagemProduto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Produto',
        key: 'id'
      }
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'ImagemProduto',
    timestamps: false
  });

  ImagemProduto.associate = (models) => {
    ImagemProduto.belongsTo(models.Produto, {
      foreignKey: 'product_id'
    });
  };

  return ImagemProduto;
};
