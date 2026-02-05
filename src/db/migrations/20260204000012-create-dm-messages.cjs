'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dm_messages', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      conversationId: {
        type: Sequelize.UUID,
        field: 'conversation_id',
        allowNull: false,
        references: {
          model: 'dm_conversations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      senderId: {
        type: Sequelize.UUID,
        field: 'sender_id',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      imageUrl: {
        type: Sequelize.STRING,
        field: 'image_url',
        allowNull: true
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        field: 'is_deleted',
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
    await queryInterface.addIndex('dm_messages', ['conversation_id']);
    await queryInterface.addIndex('dm_messages', ['sender_id']);
    await queryInterface.addIndex('dm_messages', ['is_deleted']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dm_messages');
  }
};
