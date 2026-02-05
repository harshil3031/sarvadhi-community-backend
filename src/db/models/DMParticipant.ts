import { DataTypes, Model, Sequelize } from 'sequelize';

export interface DMParticipantAttributes {
  conversationId: string;
  userId: string;
  joinedAt?: Date; // Optional because defaults to NOW
}

export class DMParticipant extends Model<DMParticipantAttributes> implements DMParticipantAttributes {
  declare conversationId: string;
  declare userId: string;
  declare joinedAt: Date;
}

export const initDMParticipant = (sequelize: Sequelize) => {
  DMParticipant.init(
    {
      conversationId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'dm_conversations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'dm_participants',
      timestamps: false,
      underscored: true
    }
  );
};

export default DMParticipant;
