import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface FavoriteAttributes {
  id: number;
  customerId: number;
  restaurantId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FavoriteCreationAttributes extends Omit<FavoriteAttributes, 'id'> {}

class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  public id!: number;
  public customerId!: number;
  public restaurantId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'favorites',
    indexes: [
      {
        unique: true,
        fields: ['customerId', 'restaurantId'],
      },
    ],
  }
);

export default Favorite; 