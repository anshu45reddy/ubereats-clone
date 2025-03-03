import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import Layout from '../../components/Layout';
import { Order, OrderStatus } from '../../types/order';
import * as restaurantService from '../../services/restaurant.service';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const data = await restaurantService.getRestaurantOrders(statusFilter || undefined);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await restaurantService.updateOrderStatus(orderId, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'primary';
      case 'Preparing':
        return 'warning';
      case 'On the Way':
      case 'Pick-up Ready':
        return 'info';
      case 'Delivered':
      case 'Picked Up':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const orderStatuses: OrderStatus[] = [
    'New',
    'Order Received',
    'Preparing',
    'On the Way',
    'Pick-up Ready',
    'Delivered',
    'Picked Up',
    'Cancelled',
  ];

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Order Management</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Orders</MenuItem>
              {orderStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {orders.map((order: Order) => (
            <Grid item xs={12} sm={6} md={4} key={order.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Order #{order.id}</Typography>
                    <FormControl size="small">
                      <Select
                        value={order.status}
                        onChange={(e: SelectChangeEvent) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        sx={{ minWidth: 150 }}
                      >
                        {orderStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Customer: {order.customer?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                    Items:
                  </Typography>
                  {order.items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        ml: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {item.quantity}x {item.dish?.name}
                      </Typography>
                      <Typography variant="body2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 2,
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle1">Total</Typography>
                    <Typography variant="subtitle1">
                      ${order.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status) as any}
                      sx={{ width: '100%' }}
                    />
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

export default Orders; 