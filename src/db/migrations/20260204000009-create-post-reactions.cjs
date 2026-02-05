'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_reactions', {
      postId: {
        type: Sequelize.UUID,
        field: 'post_id',
        primaryKey: true,
        references: {
          model: 'posts',
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
      emoji: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Indexes
    await queryInterface.addIndex('post_reactions', ['post_id']);
    await queryInterface.addIndex('post_reactions', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('post_reactions');
  }
};
