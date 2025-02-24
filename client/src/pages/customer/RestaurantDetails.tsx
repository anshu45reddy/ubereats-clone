import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Restaurant, Dish } from '../../types/restaurant';
import * as restaurantService from '../../services/restaurant.service';
import * as customerService from '../../services/customer.service';
import * as orderService from '../../services/order.service';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface CartItem {
  dish: Dish;
  quantity: number;
}

const formatPrice = (price: any): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
};

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const [restaurantData, favoritesData] = await Promise.all([
          restaurantService.getRestaurantDetails(id),
          customerService.getFavorites()
        ]);
        
        setRestaurant(restaurantData);
        setFavorites(favoritesData);
        
        // Check if this restaurant is in favorites
        const isInFavorites = favoritesData.some(fav => fav.id === id);
        setIsFavorite(isInFavorites);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error fetching restaurant details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showSnackbar]);

  const handleFavoriteToggle = async () => {
    if (!id || !restaurant) return;
    
    try {
      if (isFavorite) {
        await customerService.removeFavorite(id);
        setIsFavorite(false);
        showSnackbar('Restaurant removed from favorites', 'success');
      } else {
        await customerService.addFavorite(id);
        setIsFavorite(true);
        showSnackbar('Restaurant added to favorites', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showSnackbar('Failed to update favorites', 'error');
    }
  };

  const addToCart = (dish: Dish) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.dish.id === dish.id);
      if (existingItem) {
        return prev.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
    showSnackbar(`Added ${dish.name} to cart`, 'success');
  };

  const removeFromCart = (dishId: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.dish.id === dishId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.dish.id === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.dish.id !== dishId);
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => {
        const price = typeof item.dish.price === 'string' 
          ? parseFloat(item.dish.price) 
          : item.dish.price;
        return total + price * item.quantity;
      },
      0
    );
  };

  const handleCheckout = async () => {
    try {
      if (!restaurant || !user) return;

      const orderData = {
        restaurantId: restaurant.id,
        items: cartItems.map(item => ({
          dishId: item.dish.id,
          quantity: item.quantity,
        })),
      };

      await orderService.createOrder(orderData);
      setCartItems([]);
      setCartOpen(false);
      showSnackbar('Order placed successfully!', 'success');
      
      // Navigate to orders page after successful checkout
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      showSnackbar('Error placing order', 'error');
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!restaurant) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          Restaurant not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Restaurants
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Box mb={4} mt={2}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Back to Restaurants
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            {restaurant.name}
          </Typography>
          <IconButton 
            onClick={handleFavoriteToggle}
            color={isFavorite ? "error" : "default"}
            sx={{ '&:hover': { color: 'error.main' } }}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        
        <Typography variant="body1" paragraph>
          {restaurant.description || 'No description available'}
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Chip label={restaurant.location || 'Location not specified'} variant="outlined" />
          {restaurant.timings && <Chip label={restaurant.timings} variant="outlined" />}
          {restaurant.contactInfo && <Chip label={restaurant.contactInfo} variant="outlined" />}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Menu
        </Typography>
      </Box>

      {restaurant.dishes && restaurant.dishes.length > 0 ? (
        <Grid container spacing={3}>
          {restaurant.dishes.map((dish) => (
            <Grid item xs={12} sm={6} md={4} key={dish.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={dish.image || 'https://via.placeholder.com/300x200?text=Dish'}
                  alt={dish.name}
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x200?text=Dish';
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {dish.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {dish.description || 'No description available'}
                  </Typography>
                  {dish.category && (
                    <Chip 
                      label={dish.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="h6">
                      ${formatPrice(dish.price)}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => addToCart(dish)}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center">
          No dishes available for this restaurant.
        </Typography>
      )}

      {cartItems.length > 0 && (
        <Box
          position="fixed"
          bottom={16}
          right={16}
          zIndex={1000}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setCartOpen(true)}
          >
            Cart ({getTotalItems()}) - ${formatPrice(getTotalPrice())}
          </Button>
        </Box>
      )}

      <Dialog 
        open={cartOpen} 
        onClose={() => setCartOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Your Cart</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {restaurant.name}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {cartItems.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
              Your cart is empty
            </Typography>
          ) : (
            cartItems.map((item) => (
              <Box
                key={item.dish.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                pb={1}
                borderBottom="1px solid #eee"
              >
                <Box>
                  <Typography variant="body1">{item.dish.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${formatPrice(item.dish.price)} x {item.quantity}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.dish.id)}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => addToCart(item.dish)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
          
          {cartItems.length > 0 && (
            <Box mt={2} pt={2} borderTop="1px solid #eee">
              <Typography variant="h6" align="right">
                Total: ${formatPrice(getTotalPrice())}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Checkout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RestaurantDetails; 