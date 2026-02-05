'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dm_participants', {
      conversationId: {
        type: Sequelize.UUID,
        field: 'conversation_id',
        primaryKey: true,
        references: {
          model: 'dm_conversations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        field: 'user_id',
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      joinedAt: {
        type: Sequelize.DATE,
        field: 'joined_at',
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Indexes
    await queryInterface.addIndex('dm_participants', ['conversation_id']);
    await queryInterface.addIndex('dm_participants', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dm_participants');
  }
};
