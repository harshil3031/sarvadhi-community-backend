import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface ChannelAttributes {
  id?: string; // Optional because auto-generated
  name: string;
  description?: string | null;
  type: 'public' | 'private';
  createdBy: string;
  deletedAt?: Date | null;
}

export class Channel extends Model<ChannelAttributes> implements ChannelAttributes {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare type: 'public' | 'private';
  declare createdBy: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

export const initChannel = (sequelize: Sequelize) => {
  Channel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public'
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      tableName: 'channels',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );
};

export default Channel;
