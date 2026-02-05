import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface UserAttributes {
  id?: string; // Optional because auto-generated with defaultValue
  fullName: string;
  email: string;
  role: 'admin' | 'moderator' | 'employee';
  authProvider: 'local' | 'google';
  passwordHash?: string | null;
  googleId?: string | null;
  profilePhotoUrl?: string | null;
  department?: string | null;
  isActive: boolean;
  lastSeenAt?: Date | null;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare role: 'admin' | 'moderator' | 'employee';
  declare authProvider: 'local' | 'google';
  declare passwordHash: string | null;
  declare googleId: string | null;
  declare profilePhotoUrl: string | null;
  declare department: string | null;
  declare isActive: boolean;
  declare lastSeenAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initUser = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      role: {
        type: DataTypes.ENUM('admin', 'moderator', 'employee'),
        allowNull: false,
        defaultValue: 'employee'
      },
      authProvider: {
        type: DataTypes.ENUM('local', 'google'),
        allowNull: false
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      profilePhotoUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      underscored: true
    }
  );
};

export default User;
