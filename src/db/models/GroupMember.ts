import { DataTypes, Model, Sequelize } from 'sequelize';

export interface GroupMemberAttributes {
  groupId: string;
  userId: string;
  joinedAt?: Date; // Optional because defaults to NOW
}

export class GroupMember extends Model<GroupMemberAttributes> implements GroupMemberAttributes {
  declare groupId: string;
  declare userId: string;
  declare joinedAt: Date;
}

export const initGroupMember = (sequelize: Sequelize) => {
  GroupMember.init(
    {
      groupId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'groups',
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
      tableName: 'group_members',
      timestamps: false,
      underscored: true
    }
  );
};

export default GroupMember;
