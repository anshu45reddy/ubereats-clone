import React, { useState, useEffect, MouseEvent } from 'react';
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
} from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { Restaurant } from '../../types/restaurant';
import * as customerService from '../../services/customer.service';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await customerService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: number) => {
    try {
      await customerService.removeFavorite(restaurantId);
      setFavorites(favorites.filter((restaurant: Restaurant) => restaurant.id !== restaurantId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Favorite Restaurants
        </Typography>

        <Grid container spacing={3}>
          {favorites.map((restaurant: Restaurant) => (
            <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={restaurant.profilePicture || '/restaurant-placeholder.jpg'}
                  alt={restaurant.name}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {restaurant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {restaurant.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {restaurant.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.timings}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        handleRemoveFavorite(restaurant.id);
                      }}
                      color="secondary"
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {favorites.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center">
                You haven't added any restaurants to your favorites yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Favorites; 