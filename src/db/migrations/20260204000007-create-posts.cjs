'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      authorId: {
        type: Sequelize.UUID,
        field: 'author_id',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      channelId: {
        type: Sequelize.UUID,
        field: 'channel_id',
        allowNull: true,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      groupId: {
        type: Sequelize.UUID,
        field: 'group_id',
        allowNull: true,
        references: {
          model: 'groups',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isPinned: {
        type: Sequelize.BOOLEAN,
        field: 'is_pinned',
        allowNull: false,
        defaultValue: false
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
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Indexes
    await queryInterface.addIndex('posts', ['author_id']);
    await queryInterface.addIndex('posts', ['channel_id']);
    await queryInterface.addIndex('posts', ['group_id']);
    await queryInterface.addIndex('posts', ['is_deleted']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};
