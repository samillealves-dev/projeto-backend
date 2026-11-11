
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ImagemProduto', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Produto',
          key: 'id'
        }
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ImagemProduto');
  }
};
