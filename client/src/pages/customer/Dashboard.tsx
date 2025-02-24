import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Chip,
  Container,
  Paper,
  Divider,
  Rating,
  Skeleton,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn,
  AccessTime,
  Fastfood,
  LocalPizza,
  Restaurant as RestaurantIcon,
  LocalDining,
  EmojiFoodBeverage,
  Cake,
  FilterAlt,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { Restaurant } from '../../types/restaurant';
import * as restaurantService from '../../services/restaurant.service';
import * as customerService from '../../services/customer.service';

// Debounce function to prevent too many API calls
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Food categories for filtering
const categories = [
  { id: 'all', label: 'All', icon: <RestaurantIcon /> },
  { id: 'pizza', label: 'Pizza', icon: <LocalPizza /> },
  { id: 'burger', label: 'Burgers', icon: <Fastfood /> },
  { id: 'sushi', label: 'Sushi', icon: <LocalDining /> },
  { id: 'coffee', label: 'Coffee', icon: <EmojiFoodBeverage /> },
  { id: 'dessert', label: 'Desserts', icon: <Cake /> },
];

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  
  // Debounce search query to prevent too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [restaurantList, favoritesList] = await Promise.all([
        restaurantService.getRestaurants(debouncedSearchQuery),
        customerService.getFavorites(),
      ]);
      
      // Filter out duplicate restaurants by name
      const uniqueRestaurants = restaurantList.reduce((acc: Restaurant[], current) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      setRestaurants(uniqueRestaurants);
      setFavorites(favoritesList);
      setFavoriteIds(favoritesList.map((fav) => fav.id));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load restaurants. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFavoriteToggle = async (restaurantId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to restaurant details
    
    try {
      if (favoriteIds.includes(restaurantId)) {
        await customerService.removeFavorite(restaurantId);
        setFavoriteIds(favoriteIds.filter((id) => id !== restaurantId));
        setFavorites(favorites.filter((fav) => fav.id !== restaurantId));
        setSnackbar({
          open: true,
          message: 'Restaurant removed from favorites',
          severity: 'success'
        });
      } else {
        await customerService.addFavorite(restaurantId);
        setFavoriteIds([...favoriteIds, restaurantId]);
        
        // Find the restaurant in the list and add it to favorites
        const restaurant = restaurants.find((r) => r.id === restaurantId);
        if (restaurant) {
          setFavorites([...favorites, restaurant]);
        }
        
        setSnackbar({
          open: true,
          message: 'Restaurant added to favorites',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update favorites. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  // Filter restaurants based on selected category
  const filteredRestaurants = selectedCategory === 'all' 
    ? restaurants 
    : restaurants.filter(restaurant => 
        restaurant.description?.toLowerCase().includes(selectedCategory) ||
        restaurant.name?.toLowerCase().includes(selectedCategory)
      );

  // Generate a random rating for demo purposes
  const getRandomRating = () => {
    return (3 + Math.random() * 2).toFixed(1);
  };

  // Generate a random delivery time for demo purposes
  const getRandomDeliveryTime = () => {
    return Math.floor(15 + Math.random() * 30);
  };

  return (
    <Layout>
      <Box 
        sx={{ 
          backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
          pt: 4, 
          pb: 6 
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              fontWeight="bold" 
              gutterBottom
              sx={{ mb: 2 }}
            >
              Food delivery & takeout
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
              Order from your favorite restaurants with free delivery on your first order
            </Typography>
            
            {/* Search Bar */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 0.5, 
                display: 'flex', 
                maxWidth: 600, 
                mx: 'auto',
                borderRadius: 3,
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search for food, cuisines, restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 1 }}>
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ px: 1 }}
              />
              <Button 
                variant="contained" 
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Search
              </Button>
            </Paper>
          </Box>

          {/* Category Tabs */}
          <Paper elevation={1} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ 
                bgcolor: 'background.paper',
                '& .MuiTab-root': {
                  minHeight: 72,
                  fontSize: '0.875rem',
                }
              }}
            >
              {categories.map((category) => (
                <Tab 
                  key={category.id} 
                  value={category.id} 
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {category.icon}
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {category.label}
                      </Typography>
                    </Box>
                  } 
                />
              ))}
            </Tabs>
          </Paper>

          {/* Restaurant List */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={32} width="80%" />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
              <Button variant="contained" onClick={() => fetchData()} sx={{ mt: 2 }}>
                Try Again
              </Button>
            </Box>
          ) : filteredRestaurants.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 8 }}>
              <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No restaurants found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search or category filter
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" fontWeight="medium">
                  {selectedCategory === 'all' 
                    ? 'All Restaurants' 
                    : `${categories.find(c => c.id === selectedCategory)?.label} Restaurants`}
                </Typography>
                <Chip 
                  icon={<FilterAlt />} 
                  label={`${filteredRestaurants.length} results`} 
                  variant="outlined" 
                />
              </Box>
              
              <Grid container spacing={3}>
                {filteredRestaurants.map((restaurant) => {
                  const rating = getRandomRating();
                  const deliveryTime = getRandomDeliveryTime();
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6,
                          },
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={restaurant.profilePicture || 'https://via.placeholder.com/300x180?text=Restaurant'}
                            alt={restaurant.name || 'Restaurant'}
                            sx={{ objectFit: 'cover' }}
                            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/300x180?text=Restaurant';
                            }}
                          />
                          <IconButton
                            onClick={(e) => handleFavoriteToggle(restaurant.id, e)}
                            color={favoriteIds.includes(restaurant.id) ? "error" : "default"}
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': { 
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                color: 'error.main' 
                              }
                            }}
                          >
                            {favoriteIds.includes(restaurant.id) ? (
                              <FavoriteIcon />
                            ) : (
                              <FavoriteBorderIcon />
                            )}
                          </IconButton>
                          
                          {/* Delivery time badge */}
                          <Chip
                            label={`${deliveryTime} min`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Box 
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { color: 'primary.main' }
                            }}
                            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                          >
                            <Typography variant="h6" gutterBottom noWrap>
                              {restaurant.name || 'Restaurant Name'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating 
                                value={parseFloat(rating)} 
                                precision={0.1} 
                                readOnly 
                                size="small" 
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {rating}
                              </Typography>
                            </Box>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                height: 40,
                              }}
                            >
                              {restaurant.description || 'No description available'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }} noWrap>
                                {restaurant.location || 'Location not specified'}
                              </Typography>
                            </Box>
                            
                            {restaurant.timings && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }} noWrap>
                                  {restaurant.timings}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                        
                        <Divider />
                        
                        <Box sx={{ p: 2 }}>
                          <Button 
                            variant="contained" 
                            fullWidth
                            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                            sx={{ 
                              borderRadius: 2,
                              py: 1,
                            }}
                          >
                            View Menu
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </Container>
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Dashboard; 