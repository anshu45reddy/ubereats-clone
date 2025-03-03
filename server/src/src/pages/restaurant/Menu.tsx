import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import * as Yup from 'yup';
import Layout from '../../components/Layout';
import Form from '../../components/Form';
import { Dish, CreateDishData } from '../../types/restaurant';
import * as restaurantService from '../../services/restaurant.service';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  price: Yup.number().min(0, 'Price must be positive').required('Required'),
  category: Yup.string()
    .oneOf(['Appetizer', 'Salad', 'Main Course', 'Dessert', 'Beverage'])
    .required('Required'),
  ingredients: Yup.string().required('Required'),
  image: Yup.string().url('Must be a valid URL'),
});

const Menu = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [open, setOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const data = await restaurantService.getDishes();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const handleOpen = (dish?: Dish) => {
    if (dish) {
      setEditingDish(dish);
    } else {
      setEditingDish(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDish(null);
  };

  const handleSubmit = async (values: CreateDishData) => {
    try {
      if (editingDish) {
        await restaurantService.updateDish(editingDish.id, values);
      } else {
        await restaurantService.addDish(values);
      }
      handleClose();
      fetchDishes();
    } catch (error) {
      console.error('Error saving dish:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await restaurantService.deleteDish(id);
        fetchDishes();
      } catch (error) {
        console.error('Error deleting dish:', error);
      }
    }
  };

  const formFields = [
    {
      name: 'name',
      label: 'Name',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      multiline: true,
      rows: 3,
      required: true,
    },
    {
      name: 'price',
      label: 'Price',
      type: 'number',
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Appetizer', label: 'Appetizer' },
        { value: 'Salad', label: 'Salad' },
        { value: 'Main Course', label: 'Main Course' },
        { value: 'Dessert', label: 'Dessert' },
        { value: 'Beverage', label: 'Beverage' },
      ],
    },
    {
      name: 'ingredients',
      label: 'Ingredients',
      multiline: true,
      rows: 2,
      required: true,
    },
    {
      name: 'image',
      label: 'Image URL',
      type: 'url',
    },
  ];

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Menu Management</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Dish
          </Button>
        </Box>

        <Grid container spacing={3}>
          {dishes.map((dish) => (
            <Grid item xs={12} sm={6} md={4} key={dish.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={dish.image || '/dish-placeholder.jpg'}
                  alt={dish.name}
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
                        {dish.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {dish.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Category: {dish.category}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${dish.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpen(dish)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(dish.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editingDish ? 'Edit Dish' : 'Add New Dish'}</DialogTitle>
          <DialogContent>
            <Form
              fields={formFields}
              initialValues={
                editingDish || {
                  name: '',
                  description: '',
                  price: '',
                  category: 'Main Course',
                  ingredients: '',
                  image: '',
                }
              }
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              submitText={editingDish ? 'Update' : 'Add'}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Menu; 