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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { Restaurant } from '../../types/restaurant';
import * as restaurantService from '../../services/restaurant.service';
import * as customerService from '../../services/customer.service';

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantList, favoritesList] = await Promise.all([
          restaurantService.getRestaurants(searchQuery),
          customerService.getFavorites(),
        ]);
        setRestaurants(restaurantList);
        setFavorites(favoritesList.map((fav) => fav.id));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [searchQuery]);

  const handleFavoriteToggle = async (restaurantId: number) => {
    try {
      if (favorites.includes(restaurantId)) {
        await customerService.removeFavorite(restaurantId);
        setFavorites(favorites.filter((id) => id !== restaurantId));
      } else {
        await customerService.addFavorite(restaurantId);
        setFavorites([...favorites, restaurantId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Grid container spacing={3}>
          {restaurants.map((restaurant) => (
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
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {restaurant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.timings}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(restaurant.id);
                      }}
                      color="secondary"
                    >
                      {favorites.includes(restaurant.id) ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard; 