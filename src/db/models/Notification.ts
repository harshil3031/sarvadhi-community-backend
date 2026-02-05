import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationAttributes {
  id?: string; // optional since it has a default value
  userId: string;
  type: string;
  referenceId?: string | null;
  isRead?: boolean; // optional since it has a default value
  createdAt?: Date;
}

export class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  declare id: string;
  declare userId: string;
  declare type: string;
  declare referenceId: string | null;
  declare isRead: boolean;
  declare createdAt: Date;
}

export const initNotification = (sequelize: Sequelize) => {
  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      referenceId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      tableName: 'notifications',
      timestamps: true,
      updatedAt: false,
      underscored: true
    }
  );
};

export default Notification;
