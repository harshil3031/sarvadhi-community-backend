import { DataTypes, Model, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface GroupAttributes {
  id?: string; // Optional because auto-generated
  name: string;
  description?: string | null;
  createdBy: string;
  deletedAt?: Date | null;
}

export class Group extends Model<GroupAttributes> implements GroupAttributes {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare createdBy: string;
  declare createdAt: Date;
  declare deletedAt: Date | null;
}

export const initGroup = (sequelize: Sequelize) => {
  Group.init(
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
      tableName: 'groups',
      timestamps: true,
      paranoid: true,
      updatedAt: false,
      underscored: true
    }
  );
};

export default Group;
