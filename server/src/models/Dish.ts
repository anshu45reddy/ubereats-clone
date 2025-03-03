import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface DishAttributes {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  ingredients: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DishCreationAttributes extends Omit<DishAttributes, 'id'> {}

class Dish extends Model<DishAttributes, DishCreationAttributes> implements DishAttributes {
  public id!: number;
  public restaurantId!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public image!: string;
  public category!: string;
  public ingredients!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Dish.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('Appetizer', 'Salad', 'Main Course', 'Dessert', 'Beverage'),
      allowNull: false,
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'dishes',
  }
);

// We'll set up associations after all models are defined
export default Dish; 