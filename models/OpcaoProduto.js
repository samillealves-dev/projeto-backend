
'use strict';

module.exports = (sequelize, DataTypes) => {
  const OpcaoProduto = sequelize.define('OpcaoProduto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Produto',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shape: {
      type: DataTypes.ENUM('square', 'circle'),
      defaultValue: 'square'
    },
    radius: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM('text', 'color'),
      defaultValue: 'text'
    },
    values: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'OpcaoProduto',
    timestamps: false
  });

  OpcaoProduto.associate = (models) => {
    OpcaoProduto.belongsTo(models.Produto, {
      foreignKey: 'product_id'
    });
  };

  return OpcaoProduto;
};
