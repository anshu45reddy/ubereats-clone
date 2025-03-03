import bcrypt from 'bcryptjs';
import User from '../models/User';
import Dish from '../models/Dish';

const seedData = async () => {
  try {
    // Check if data already exists
    const existingRestaurants = await User.findAll({
      where: { role: 'restaurant' }
    });

    if (existingRestaurants.length > 0) {
      console.log('Seed data already exists, skipping...');
      return;
    }

    // Create sample restaurants
    const restaurants = [
      {
        name: 'Italian Delight',
        email: 'italian@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'restaurant' as const,
        location: '123 Main St, San Francisco, CA',
        description: 'Authentic Italian cuisine in the heart of the city',
        contactInfo: '(415) 555-0123',
        timings: 'Mon-Sun: 11:00 AM - 10:00 PM',
        profilePicture: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      },
      {
        name: 'Sushi Master',
        email: 'sushi@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'restaurant' as const,
        location: '456 Market St, San Francisco, CA',
        description: 'Premium Japanese sushi and sashimi',
        contactInfo: '(415) 555-0124',
        timings: 'Tue-Sun: 12:00 PM - 9:30 PM',
        profilePicture: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      },
      {
        name: 'Taco Fiesta',
        email: 'taco@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'restaurant' as const,
        location: '789 Mission St, San Francisco, CA',
        description: 'Authentic Mexican street food',
        contactInfo: '(415) 555-0125',
        timings: 'Mon-Sun: 10:00 AM - 11:00 PM',
        profilePicture: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
      },
    ];

    for (const restaurantData of restaurants) {
      const restaurant = await User.create(restaurantData);

      // Create sample dishes for each restaurant
      if (restaurant.role === 'restaurant') {
        const dishes = [
          {
            restaurantId: restaurant.id,
            name: 'Signature Dish 1',
            description: 'Our most popular dish with special house sauce',
            price: 15.99,
            category: 'Main Course' as const,
            ingredients: 'Fresh ingredients, house-made sauce',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          },
          {
            restaurantId: restaurant.id,
            name: 'Special Appetizer',
            description: 'Perfect starter to share',
            price: 8.99,
            category: 'Appetizer' as const,
            ingredients: 'Seasonal vegetables, special spices',
            image: 'https://images.unsplash.com/photo-1580013759032-c96505e24c1f',
          },
          {
            restaurantId: restaurant.id,
            name: 'Dessert Special',
            description: 'Sweet ending to your meal',
            price: 6.99,
            category: 'Dessert' as const,
            ingredients: 'Fresh fruits, cream, chocolate',
            image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
          },
        ];

        await Dish.bulkCreate(dishes);
      }
    }

    // Check if customer already exists
    const existingCustomer = await User.findOne({
      where: { email: 'customer@example.com' }
    });

    if (!existingCustomer) {
      // Create a sample customer
      await User.create({
        name: 'John Doe',
        email: 'customer@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'customer' as const,
        location: 'San Francisco, CA',
      });
    }

    console.log('Sample data has been seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

export default seedData; 