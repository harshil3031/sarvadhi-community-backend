import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface CommentAttributes {
  id?: string; // Optional because auto-generated
  postId: string;
  authorId: string;
  content: string;
  isDeleted?: boolean; // Optional with default
}

export class Comment extends Model<CommentAttributes> implements CommentAttributes {
  declare id: string;
  declare postId: string;
  declare authorId: string;
  declare content: string;
  declare isDeleted: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initComment = (sequelize: Sequelize) => {
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      tableName: 'comments',
      timestamps: true,
      updatedAt: false,
      underscored: true
    }
  );
};

export default Comment;
