import { DataTypes, Model, Sequelize } from 'sequelize';

export interface ChannelMemberAttributes {
  channelId: string;
  userId: string;
  joinedAt?: Date; // Optional because defaults to NOW
}

export class ChannelMember extends Model<ChannelMemberAttributes> implements ChannelMemberAttributes {
  declare channelId: string;
  declare userId: string;
  declare joinedAt: Date;
}

export const initChannelMember = (sequelize: Sequelize) => {
  ChannelMember.init(
    {
      channelId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'channels',
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
      tableName: 'channel_members',
      timestamps: false,
      underscored: true
    }
  );
};

export default ChannelMember;
