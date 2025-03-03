import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface OrderAttributes {
  id: number;
  customerId: number;
  restaurantId: number;
  status: 'New' | 'Order Received' | 'Preparing' | 'On the Way' | 'Pick-up Ready' | 'Delivered' | 'Picked Up' | 'Cancelled';
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Omit<OrderAttributes, 'id'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public customerId!: number;
  public restaurantId!: number;
  public status!: 'New' | 'Order Received' | 'Preparing' | 'On the Way' | 'Pick-up Ready' | 'Delivered' | 'Picked Up' | 'Cancelled';
  public totalAmount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
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
    status: {
      type: DataTypes.ENUM(
        'New',
        'Order Received',
        'Preparing',
        'On the Way',
        'Pick-up Ready',
        'Delivered',
        'Picked Up',
        'Cancelled'
      ),
      allowNull: false,
      defaultValue: 'New',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'orders',
  }
);

// Create OrderItem model
interface OrderItemAttributes {
  id: number;
  orderId: number;
  dishId: number;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderItemCreationAttributes extends Omit<OrderItemAttributes, 'id'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public dishId!: number;
  public quantity!: number;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dishId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'order_items',
  }
);

export { Order, OrderItem }; 