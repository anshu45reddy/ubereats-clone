import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
import sequelize from './config/database';
import seedData from './utils/seedData';

// Import associations to set them up
import './models/associations';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    path: '/'
  }
}));

// Add debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Session:', req.session);
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UberEATS Prototype API',
      version: '1.0.0',
      description: 'API documentation for UberEATS prototype'
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/restaurants', restaurantRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Database synchronization and server start
const startServer = async () => {
  try {
    // First try to authenticate without syncing
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Use a more conservative sync approach to avoid key errors
    try {
      // Simple sync without altering schema to avoid "Too many keys" error
      await sequelize.sync({ force: false });
      console.log('Database synchronized successfully');
    } catch (syncError) {
      console.warn('Database sync failed:', syncError.message);
      // If that fails, just continue without syncing
    }

    // Check if data exists before seeding
    const checkDataExists = async () => {
      try {
        const [results] = await sequelize.query('SELECT COUNT(*) as count FROM users');
        const count = (results as any)[0]?.count || 0;
        return count > 0;
      } catch (error) {
        console.error('Error checking if data exists:', error);
        return false;
      }
    };

    // Seed data if in development mode and no data exists
    if (process.env.NODE_ENV !== 'production') {
      const hasData = await checkDataExists();
      if (!hasData) {
        try {
          await seedData();
          console.log('Database seeded successfully');
        } catch (seedError) {
          console.error('Error seeding database:', seedError);
          console.log('Continuing without seeding data');
        }
      } else {
        console.log('Seed data already exists, skipping...');
      }
    }

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer(); 