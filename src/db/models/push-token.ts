import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface PushTokenAttributes {
  id?: string;
  userId: string;
  token: string;
  platform: 'android' | 'ios';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PushToken
  extends Model<PushTokenAttributes>
  implements PushTokenAttributes
{
  declare id: string;
  declare userId: string;
  declare token: string;
  declare platform: 'android' | 'ios';
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initPushToken = (sequelize: Sequelize) => {
  PushToken.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false,
      },

      userId: {
        type: DataTypes.UUID,
        field: 'user_id',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      platform: {
        type: DataTypes.ENUM('android', 'ios'),
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        field: 'is_active',
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'push_tokens',
      timestamps: true,
      underscored: true,
    }
  );
};

export default PushToken;
