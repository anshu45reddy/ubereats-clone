import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
  Paper,
  Divider,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AttachMoney,
  Category as CategoryIcon,
  Image as ImageIcon,
  Restaurant as RestaurantIcon,
  Fastfood,
  LocalPizza,
  EmojiFoodBeverage,
  Cake,
  LocalDining,
  Search as SearchIcon,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { Dish, CreateDishData } from '../../types/restaurant';
import * as restaurantService from '../../services/restaurant.service';
import { useAuth } from '../../contexts/AuthContext';

// Helper function to format price
const formatPrice = (price: any): string => {
  // Convert price to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  // Check if it's a valid number
  return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
};

// Categories with icons
const categories = [
  { value: 'all', label: 'All', icon: <RestaurantIcon /> },
  { value: 'Appetizer', label: 'Appetizers', icon: <LocalDining /> },
  { value: 'Salad', label: 'Salads', icon: <LocalDining /> },
  { value: 'Main Course', label: 'Main Courses', icon: <Fastfood /> },
  { value: 'Dessert', label: 'Desserts', icon: <Cake /> },
  { value: 'Beverage', label: 'Beverages', icon: <EmojiFoodBeverage /> },
];

const Menu = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState<CreateDishData>({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    ingredients: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setRefreshing(true);
      const data = await restaurantService.getDishes();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load dishes. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpen = (dish?: Dish) => {
    setFormErrors({});
    if (dish) {
      setSelectedDish(dish);
      setFormData({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        ingredients: dish.ingredients,
        image: dish.image,
      });
      setImagePreview(dish.image || null);
    } else {
      setSelectedDish(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        ingredients: '',
      });
      setImagePreview(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDish(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Main Course',
      ingredients: '',
    });
    setImagePreview(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!formData.ingredients.trim()) {
      errors.ingredients = 'Ingredients are required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (selectedDish) {
        await restaurantService.updateDish(selectedDish.id, formData);
        setSnackbar({
          open: true,
          message: 'Dish updated successfully',
          severity: 'success'
        });
      } else {
        await restaurantService.addDish(formData);
        setSnackbar({
          open: true,
          message: 'Dish added successfully',
          severity: 'success'
        });
      }
      handleClose();
      fetchDishes();
    } catch (error) {
      console.error('Error saving dish:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save dish. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await restaurantService.deleteDish(id);
        setSnackbar({
          open: true,
          message: 'Dish deleted successfully',
          severity: 'success'
        });
        fetchDishes();
      } catch (error) {
        console.error('Error deleting dish:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete dish. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a server
      // For now, we'll just create a local URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData({ ...formData, image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter dishes based on category and search query
  const filteredDishes = dishes.filter(dish => {
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group dishes by category for display
  const dishesByCategory = filteredDishes.reduce((acc, dish) => {
    if (!acc[dish.category]) {
      acc[dish.category] = [];
    }
    acc[dish.category].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  return (
    <Layout>
      <Box 
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f8f9fa',
          pt: 4, 
          pb: 6 
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Menu Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your restaurant's dishes
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{ borderRadius: 2 }}
            >
              Add New Dish
            </Button>
          </Box>

          {/* Search and Filter */}
          <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search dishes by name, description, or ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button 
                  startIcon={<Refresh />} 
                  onClick={fetchDishes}
                  disabled={refreshing}
                  sx={{ mr: 1 }}
                >
                  Refresh
                </Button>
                <Button 
                  startIcon={<FilterList />}
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  disabled={selectedCategory === 'all' && searchQuery === ''}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Category Tabs */}
          <Paper elevation={1} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ bgcolor: 'background.paper' }}
            >
              {categories.map((category) => (
                <Tab 
                  key={category.value} 
                  value={category.value} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {category.icon}
                      <Typography sx={{ ml: 1 }}>{category.label}</Typography>
                    </Box>
                  } 
                />
              ))}
            </Tabs>
          </Paper>

          {/* Dishes */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={32} width="80%" />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                      <Skeleton variant="text" height={24} width="30%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredDishes.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No dishes found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {selectedCategory !== 'all' || searchQuery !== '' ? 
                  'Try adjusting your search or category filter' : 
                  'Add your first dish to get started'}
              </Typography>
              {selectedCategory !== 'all' || searchQuery !== '' ? (
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  sx={{ mr: 2 }}
                >
                  Clear Filters
                </Button>
              ) : null}
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Add New Dish
              </Button>
            </Paper>
          ) : (
            selectedCategory === 'all' ? (
              // Display dishes grouped by category
              Object.entries(dishesByCategory).map(([category, categoryDishes]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight="medium">
                      {category}
                    </Typography>
                    <Chip 
                      label={`${categoryDishes.length} items`} 
                      size="small" 
                      sx={{ ml: 2 }} 
                    />
                  </Box>
                  <Grid container spacing={3}>
                    {categoryDishes.map((dish) => (
                      <Grid item xs={12} sm={6} md={4} key={dish.id}>
                        <DishCard 
                          dish={dish} 
                          onEdit={() => handleOpen(dish)} 
                          onDelete={() => handleDelete(dish.id)} 
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Divider sx={{ mt: 4 }} />
                </Box>
              ))
            ) : (
              // Display filtered dishes without category grouping
              <Grid container spacing={3}>
                {filteredDishes.map((dish) => (
                  <Grid item xs={12} sm={6} md={4} key={dish.id}>
                    <DishCard 
                      dish={dish} 
                      onEdit={() => handleOpen(dish)} 
                      onDelete={() => handleDelete(dish.id)} 
                    />
                  </Grid>
                ))}
              </Grid>
            )
          )}
        </Container>
      </Box>

      {/* Add/Edit Dish Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" fontWeight="bold">
            {selectedDish ? 'Edit Dish' : 'Add New Dish'}
          </Typography>
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dish Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RestaurantIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  margin="normal"
                  required
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Appetizer">Appetizer</MenuItem>
                    <MenuItem value="Salad">Salad</MenuItem>
                    <MenuItem value="Main Course">Main Course</MenuItem>
                    <MenuItem value="Dessert">Dessert</MenuItem>
                    <MenuItem value="Beverage">Beverage</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                  error={!!formErrors.ingredients}
                  helperText={formErrors.ingredients}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Dish Image
                  </Typography>
                  <Box 
                    sx={{ 
                      border: `1px dashed ${theme.palette.divider}`,
                      borderRadius: 1,
                      height: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            p: 1,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption">
                            Click to change image
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click to upload an image
                        </Typography>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </Box>
                </Box>
                
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={7}
                  required
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={selectedDish ? <EditIcon /> : <AddIcon />}>
              {selectedDish ? 'Update Dish' : 'Add Dish'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
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

// Dish Card Component
interface DishCardProps {
  dish: Dish;
  onEdit: () => void;
  onDelete: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onEdit, onDelete }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={dish.image || 'https://via.placeholder.com/300x180?text=No+Image'}
          alt={dish.name}
          sx={{ objectFit: 'cover' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x180?text=No+Image';
          }}
        />
        <Chip
          label={dish.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 'medium',
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" gutterBottom noWrap>
            {dish.name}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            ${formatPrice(dish.price)}
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
          {dish.description}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <b>Ingredients:</b> {dish.ingredients}
        </Typography>
      </CardContent>
      
      <Divider />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
        <Tooltip title="Edit Dish">
          <IconButton onClick={onEdit} color="primary" size="small">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Dish">
          <IconButton onClick={onDelete} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default Menu; 