import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface DMMessageAttributes {
  id?: string; // Optional because auto-generated
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string | null;
  isDeleted?: boolean; // Optional with default
}

export class DMMessage extends Model<DMMessageAttributes> implements DMMessageAttributes {
  declare id: string;
  declare conversationId: string;
  declare senderId: string;
  declare content: string;
  declare imageUrl: string | null;
  declare isDeleted: boolean;
  declare createdAt: Date;
}

export const initDMMessage = (sequelize: Sequelize) => {
  DMMessage.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      conversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'dm_conversations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      tableName: 'dm_messages',
      timestamps: true,
      updatedAt: false,
      underscored: true
    }
  );
};

export default DMMessage;
