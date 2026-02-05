'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dm_conversations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      isGroup: {
        type: Sequelize.BOOLEAN,
        field: 'is_group',
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Indexes
    await queryInterface.addIndex('dm_conversations', ['is_group']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dm_conversations');
  }
};
