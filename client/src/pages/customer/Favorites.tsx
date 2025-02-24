import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { Restaurant } from '../../types/restaurant';
import * as customerService from '../../services/customer.service';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getFavorites();
      console.log('Fetched favorites:', data); // Debug log
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: string) => {
    try {
      await customerService.removeFavorite(restaurantId);
      setFavorites(favorites.filter((restaurant) => restaurant.id !== restaurantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('Failed to remove from favorites. Please try again.');
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Favorite Restaurants
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button variant="contained" onClick={fetchFavorites} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Box>
        ) : favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="body1" color="text.secondary">
              You haven't added any restaurants to your favorites yet.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/restaurants')} 
              sx={{ mt: 2 }}
            >
              Browse Restaurants
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={restaurant.profilePicture || 'https://via.placeholder.com/300x200?text=Restaurant'}
                    alt={restaurant.name || 'Restaurant'}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x200?text=Restaurant';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {restaurant.name || 'Restaurant Name'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {restaurant.description || 'No description available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {restaurant.location || 'Location not specified'}
                        </Typography>
                        {restaurant.timings && (
                          <Typography variant="body2" color="text.secondary">
                            {restaurant.timings}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(restaurant.id);
                        }}
                        color="error"
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    >
                      View Menu
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Layout>
  );
};

export default Favorites; 