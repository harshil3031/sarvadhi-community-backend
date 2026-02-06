'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('push_tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },

      userId: {
        type: Sequelize.UUID,
        field: 'user_id',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      platform: {
        type: Sequelize.ENUM('android', 'ios'),
        allowNull: false
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        field: 'is_active',
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('push_tokens', ['user_id']);
    await queryInterface.addIndex('push_tokens', ['platform']);
    await queryInterface.addIndex('push_tokens', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('push_tokens');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_push_tokens_platform";'
    );
  }
};
