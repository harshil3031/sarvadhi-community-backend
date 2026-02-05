import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface DMConversationAttributes {
  id?: string; // Optional because auto-generated
  isGroup: boolean;
}

export class DMConversation extends Model<DMConversationAttributes> implements DMConversationAttributes {
  declare id: string;
  declare isGroup: boolean;
  declare createdAt: Date;
}

export const initDMConversation = (sequelize: Sequelize) => {
  DMConversation.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      isGroup: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      tableName: 'dm_conversations',
      timestamps: true,
      updatedAt: false,
      underscored: true
    }
  );
};

export default DMConversation;
