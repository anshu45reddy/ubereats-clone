import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  Paper,
  Divider,
  Button,
  IconButton,
  Avatar,
  Badge,
  CircularProgress,
  Alert,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  AttachMoney,
  ShoppingBasket,
  LocalShipping,
  CheckCircle,
  Cancel,
  Person,
  RestaurantMenu,
  MoreVert,
  AccessTime,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { getRestaurantOrders, updateOrderStatus } from '../../services/restaurant.service';
import { Order, OrderStatus } from '../../types/order';
import { useAuth } from '../../contexts/AuthContext';

const orderStatuses = [
  'New',
  'Order Received',
  'Preparing',
  'On the Way',
  'Pick-up Ready',
  'Delivered',
  'Picked Up',
  'Cancelled',
] as const;

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const fetchedOrders = await getRestaurantOrders();
      setOrders(fetchedOrders);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Set up polling for new orders every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          String(order.id) === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'primary';
      case 'Order Received':
        return 'secondary';
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
        return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
        return <ShoppingBasket />;
      case 'Order Received':
        return <CheckCircle />;
      case 'Preparing':
        return <RestaurantMenu />;
      case 'On the Way':
        return <LocalShipping />;
      case 'Pick-up Ready':
      case 'Delivered':
      case 'Picked Up':
        return <CheckCircle />;
      case 'Cancelled':
        return <Cancel />;
      default:
        return <ShoppingBasket />;
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(order => 
    ['New', 'Order Received', 'Preparing', 'On the Way', 'Pick-up Ready'].includes(order.status)
  ).length;
  const completedOrders = orders.filter(order => 
    ['Delivered', 'Picked Up'].includes(order.status)
  ).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
                Restaurant Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Welcome back, {user?.name || 'Restaurant Owner'}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={fetchOrders}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Orders'}
            </Button>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Total Orders</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <ShoppingBasket />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : totalOrders}
                </Typography>
                <Typography variant="body2" sx={{ mt: 'auto', pt: 1 }}>
                  All time orders
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.success.main,
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Revenue</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <AttachMoney />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={100} /> : `$${totalRevenue.toFixed(2)}`}
                </Typography>
                <Typography variant="body2" sx={{ mt: 'auto', pt: 1 }}>
                  Total earnings
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.warning.main,
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Pending</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <AccessTime />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : pendingOrders}
                </Typography>
                <Typography variant="body2" sx={{ mt: 'auto', pt: 1 }}>
                  Orders in progress
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.info.main,
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Completed</Typography>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {loading ? <Skeleton width={60} /> : completedOrders}
                </Typography>
                <Typography variant="body2" sx={{ mt: 'auto', pt: 1 }}>
                  Delivered orders
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Orders Section */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}>
              <Typography variant="h5" fontWeight="medium">
                Recent Orders
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
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

            {loading ? (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Skeleton variant="text" height={32} width="60%" />
                          <Skeleton variant="text" height={24} width="40%" />
                          <Skeleton variant="text" height={24} width="70%" />
                          <Box sx={{ mt: 2 }}>
                            <Skeleton variant="text" height={24} width="100%" />
                            <Skeleton variant="text" height={24} width="100%" />
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Skeleton variant="rectangular" height={40} width="100%" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button 
                  variant="contained" 
                  onClick={fetchOrders}
                  startIcon={<Refresh />}
                >
                  Try Again
                </Button>
              </Box>
            ) : filteredOrders.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No orders found
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {statusFilter ? 
                    `No orders with status "${statusFilter}" found.` : 
                    "You don't have any orders yet."}
                </Typography>
                {statusFilter && (
                  <Button 
                    variant="outlined" 
                    onClick={() => setStatusFilter('')}
                  >
                    Show All Orders
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {filteredOrders.map((order) => (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Status indicator */}
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            height: 6, 
                            bgcolor: getStatusColor(order.status) === 'primary' 
                              ? theme.palette.primary.main
                              : getStatusColor(order.status) === 'secondary'
                              ? theme.palette.secondary.main
                              : getStatusColor(order.status) === 'warning'
                              ? theme.palette.warning.main
                              : getStatusColor(order.status) === 'info'
                              ? theme.palette.info.main
                              : getStatusColor(order.status) === 'success'
                              ? theme.palette.success.main
                              : getStatusColor(order.status) === 'error'
                              ? theme.palette.error.main
                              : theme.palette.primary.main
                          }} 
                        />
                        
                        <CardContent sx={{ pt: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                              <Typography variant="h6">Order #{order.id}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(order.createdAt)}
                              </Typography>
                            </Box>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status}
                              color={getStatusColor(order.status) as any}
                              size="small"
                            />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: theme.palette.primary.light,
                                width: 32,
                                height: 32,
                                mr: 1,
                              }}
                            >
                              <Person fontSize="small" />
                            </Avatar>
                            <Typography variant="body2">
                              {order.customer ? order.customer.name : 'Unknown Customer'}
                            </Typography>
                          </Box>

                          <Typography variant="subtitle2" gutterBottom>
                            Items:
                          </Typography>
                          <Box sx={{ mb: 2, maxHeight: 120, overflow: 'auto' }}>
                            {order.items.map((item) => (
                              <Box
                                key={item.id}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  py: 0.5,
                                  borderBottom: `1px dashed ${theme.palette.divider}`,
                                }}
                              >
                                <Typography variant="body2">
                                  {item.quantity}x {item.dish ? item.dish.name : 'Unknown Dish'}
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              bgcolor: theme.palette.action.hover,
                              p: 1.5,
                              borderRadius: 1,
                              mb: 2,
                            }}
                          >
                            <Typography variant="subtitle2">Total:</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">
                              ${order.totalAmount.toFixed(2)}
                            </Typography>
                          </Box>

                          <FormControl fullWidth size="small">
                            <InputLabel>Update Status</InputLabel>
                            <Select
                              value={order.status}
                              label="Update Status"
                              onChange={(e: SelectChangeEvent) =>
                                handleStatusChange(String(order.id), e.target.value as OrderStatus)
                              }
                            >
                              {orderStatuses.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default Dashboard; 