'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_invites', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      channelId: {
        type: Sequelize.UUID,
        field: 'channel_id',
        allowNull: false,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      invitedUserId: {
        type: Sequelize.UUID,
        field: 'invited_user_id',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      invitedBy: {
        type: Sequelize.UUID,
        field: 'invited_by',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Indexes
    await queryInterface.addIndex('channel_invites', ['channel_id']);
    await queryInterface.addIndex('channel_invites', ['invited_user_id']);
    await queryInterface.addIndex('channel_invites', ['invited_by']);
    await queryInterface.addIndex('channel_invites', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('channel_invites');
  }
};
