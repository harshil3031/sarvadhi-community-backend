import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface ChannelInviteAttributes {
  id?: string; // Optional because auto-generated
  channelId: string;
  invitedUserId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export class ChannelInvite extends Model<ChannelInviteAttributes> implements ChannelInviteAttributes {
  declare id: string;
  declare channelId: string;
  declare invitedUserId: string;
  declare invitedBy: string;
  declare status: 'pending' | 'accepted' | 'rejected';
  declare createdAt: Date;
  
  // Association properties
  declare inviter?: any; // User who sent the invite
  declare invitedUser?: any; // User who received the invite
  declare channel?: any; // Channel being invited to
}

export const initChannelInvite = (sequelize: Sequelize) => {
  ChannelInvite.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      channelId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      invitedUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      invitedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      }
    },
    {
      sequelize,
      tableName: 'channel_invites',
      timestamps: true,
      updatedAt: false,
      underscored: true
    }
  );
};

export default ChannelInvite;
