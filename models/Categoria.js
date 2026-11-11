
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
    }
  }, {
    tableName: 'Categoria',
    timestamps: true,
    createdAt: 'criadas_at',
    updatedAt: 'atualizadas_at'
  });

  // Uma categoria pode conter vários produtos
  Categoria.associate = (models) => {
    Categoria.belongsToMany(models.Produto, {
      through: models.ProdutoCategoria,
      foreignKey: 'category_id',
      otherKey: 'product_id'
    });
  };

  return Categoria;
};
