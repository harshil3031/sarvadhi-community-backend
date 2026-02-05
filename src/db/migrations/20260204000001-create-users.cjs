'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING,
        field: 'full_name',
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'moderator', 'employee'),
        allowNull: false,
        defaultValue: 'employee'
      },
      authProvider: {
        type: Sequelize.ENUM('local', 'google'),
        field: 'auth_provider',
        allowNull: false
      },
      passwordHash: {
        type: Sequelize.STRING,
        field: 'password_hash',
        allowNull: true
      },
      googleId: {
        type: Sequelize.STRING,
        field: 'google_id',
        allowNull: true,
        unique: true
      },
      profilePhotoUrl: {
        type: Sequelize.STRING,
        field: 'profile_photo_url',
        allowNull: true
      },
      department: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        field: 'is_active',
        allowNull: false,
        defaultValue: true
      },
      lastSeenAt: {
        type: Sequelize.DATE,
        field: 'last_seen_at',
        allowNull: true
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
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['google_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
