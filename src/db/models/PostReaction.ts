import { DataTypes, Model, Sequelize } from 'sequelize';

export interface PostReactionAttributes {
  postId: string;
  userId: string;
  emoji: string;
  createdAt?: Date; // Optional since auto-generated
}

export class PostReaction extends Model<PostReactionAttributes> implements PostReactionAttributes {
  declare postId: string;
  declare userId: string;
  declare emoji: string;
  declare createdAt: Date;
}

export const initPostReaction = (sequelize: Sequelize) => {
  PostReaction.init(
    {
      postId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'posts',
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
      emoji: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      sequelize,
      tableName: 'post_reactions',
      timestamps: true,
      updatedAt: false,
      underscored: true
    }
  );
};

export default PostReaction;
