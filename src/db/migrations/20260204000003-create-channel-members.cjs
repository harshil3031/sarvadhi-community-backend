'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_members', {
      channelId: {
        type: Sequelize.UUID,
        field: 'channel_id',
        primaryKey: true,
        references: {
          model: 'channels',
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
    await queryInterface.addIndex('channel_members', ['channel_id']);
    await queryInterface.addIndex('channel_members', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('channel_members');
  }
};
