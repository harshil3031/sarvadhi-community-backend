import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface PostAttributes {
  id?: string; // Optional because auto-generated
  authorId: string;
  channelId?: string | null;
  groupId?: string | null;
  content: string;
  isPinned?: boolean; // Optional with default
  isDeleted?: boolean; // Optional with default
}

export class Post extends Model<PostAttributes> implements PostAttributes {
  declare id: string;
  declare authorId: string;
  declare channelId: string | null;
  declare groupId: string | null;
  declare content: string;
  declare isPinned: boolean;
  declare isDeleted: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initPost = (sequelize: Sequelize) => {
  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      channelId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'channels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      groupId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'groups',
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
      isPinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      tableName: 'posts',
      timestamps: true,
      underscored: true,
      validate: {
        mustHaveChannelOrGroup() {
          if (!this.channelId && !this.groupId) {
            throw new Error('Post must have either channelId or groupId');
          }
          if (this.channelId && this.groupId) {
            throw new Error('Post cannot have both channelId and groupId');
          }
        }
      }
    }
  );
};

export default Post;
