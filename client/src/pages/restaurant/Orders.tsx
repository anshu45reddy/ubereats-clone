import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Refresh,
  FilterList,
  Search as SearchIcon,
  LocalShipping,
  AccessTime,
  Person,
  Receipt,
  Restaurant,
  LocalDining,
  CheckCircle,
  Cancel,
  MoreVert,
  Phone,
  LocationOn,
  Timeline,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { Order, OrderStatus } from '../../types/order';
import * as restaurantService from '../../services/restaurant.service';

// Helper function to format price
const formatPrice = (price: any): string => {
  // Convert price to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  // Check if it's a valid number
  return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
};

// Order status options with icons and descriptions
const statusOptions = [
  { value: 'New', label: 'New', icon: <Receipt />, description: 'Order just received' },
  { value: 'Order Received', label: 'Order Received', icon: <Receipt />, description: 'Order acknowledged' },
  { value: 'Preparing', label: 'Preparing', icon: <LocalDining />, description: 'Food is being prepared' },
  { value: 'On the Way', label: 'On the Way', icon: <LocalShipping />, description: 'Order is out for delivery' },
  { value: 'Pick-up Ready', label: 'Pick-up Ready', icon: <Restaurant />, description: 'Ready for customer pickup' },
  { value: 'Delivered', label: 'Delivered', icon: <CheckCircle />, description: 'Order has been delivered' },
  { value: 'Picked Up', label: 'Picked Up', icon: <CheckCircle />, description: 'Customer picked up the order' },
  { value: 'Cancelled', label: 'Cancelled', icon: <Cancel />, description: 'Order was cancelled' },
];

const Orders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const data = await restaurantService.getRestaurantOrders();
      // Handle both formats: direct array or wrapped in orders property
      const orderData = Array.isArray(data) ? data : 
                        (data && 'orders' in data) ? (data as any).orders : [];
      setOrders(orderData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
      setSnackbar({
        open: true,
        message: 'Failed to load orders. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await restaurantService.updateOrderStatus(orderId, { status: newStatus });
      setSnackbar({
        open: true,
        message: `Order #${orderId} status updated to ${newStatus}`,
        severity: 'success'
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order status. Please try again.',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string): 'primary' | 'warning' | 'info' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'New':
      case 'Order Received':
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleStatusFilterChange = (event: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
  };

  // Filter orders based on status and search query
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.id.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Group orders by status for statistics
  const orderStats = orders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = 0;
    }
    acc[order.status]++;
    return acc;
  }, {} as Record<string, number>);

  // Sort orders by creation date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Order Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track and manage your restaurant orders
            </Typography>
          </Box>

          {/* Order Statistics */}
          <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    <Receipt />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      New Orders
                    </Typography>
                    <Typography variant="h6">
                      {orderStats['New'] || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 1 }}>
                    <LocalDining />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Preparing
                    </Typography>
                    <Typography variant="h6">
                      {orderStats['Preparing'] || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 1 }}>
                    <LocalShipping />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      On the Way
                    </Typography>
                    <Typography variant="h6">
                      {orderStats['On the Way'] || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h6">
                      {(orderStats['Delivered'] || 0) + (orderStats['Picked Up'] || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Search and Filter */}
          <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by order number or customer name..."
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
                  onClick={fetchOrders}
                  disabled={refreshing}
                  sx={{ mr: 1 }}
                >
                  Refresh
                </Button>
                <Button 
                  startIcon={<FilterList />}
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  disabled={statusFilter === 'all' && searchQuery === ''}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Status Tabs */}
          <Paper elevation={1} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={statusFilter}
              onChange={handleStatusFilterChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ bgcolor: 'background.paper' }}
            >
              <Tab 
                value="all" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timeline sx={{ mr: 1 }} />
                    <Typography>All Orders</Typography>
                  </Box>
                } 
              />
              {statusOptions.map((status) => (
                <Tab 
                  key={status.value} 
                  value={status.value} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {status.icon}
                      <Typography sx={{ ml: 1 }}>{status.label}</Typography>
                      {orderStats[status.value] > 0 && (
                        <Chip 
                          size="small" 
                          label={orderStats[status.value]} 
                          color={getStatusColor(status.value)}
                          sx={{ ml: 1, height: 20, minWidth: 20 }} 
                        />
                      )}
                    </Box>
                  } 
                />
              ))}
            </Tabs>
          </Paper>

          {/* Orders */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Skeleton variant="text" height={32} width="80%" />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                      <Divider sx={{ my: 2 }} />
                      <Skeleton variant="rectangular" height={80} />
                      <Divider sx={{ my: 2 }} />
                      <Skeleton variant="text" height={24} width="30%" />
                      <Skeleton variant="rectangular" height={36} sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : sortedOrders.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No orders found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {statusFilter !== 'all' || searchQuery !== '' ? 
                  'Try adjusting your search or status filter' : 
                  'You have no orders yet'}
              </Typography>
              {statusFilter !== 'all' || searchQuery !== '' ? (
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sortedOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                  <OrderCard 
                    order={order} 
                    onStatusChange={handleStatusChange} 
                    getStatusColor={getStatusColor}
                    statusOptions={statusOptions}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

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

// Order Card Component
interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  getStatusColor: (status: string) => 'primary' | 'warning' | 'info' | 'success' | 'error' | 'default';
  statusOptions: { value: string; label: string; icon: JSX.Element; description: string }[];
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, getStatusColor, statusOptions }) => {
  const theme = useTheme();
  const statusColor = getStatusColor(order.status);
  const statusIcon = statusOptions.find(option => option.value === order.status)?.icon || <Receipt />;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        borderLeft: 4,
        borderColor: `${statusColor}.main`,
      }}
    >
      <CardContent sx={{ p: 3, pb: 3 }}>
        {/* Order Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Order #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Badge 
            badgeContent={statusIcon} 
            color={statusColor}
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Avatar sx={{ bgcolor: `${statusColor}.light`, color: `${statusColor}.dark` }}>
              <Receipt />
            </Avatar>
          </Badge>
        </Box>
        
        {/* Customer Info */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {order.customer?.name || 'Unknown Customer'}
            </Typography>
          </Box>
          {order.customer?.location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {order.customer.location}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Order Items */}
        <Typography variant="subtitle2" gutterBottom>
          Order Items
        </Typography>
        <Box sx={{ mb: 2, maxHeight: 120, overflow: 'auto' }}>
          {order.items && order.items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 0.5,
              }}
            >
              <Typography variant="body2">
                {item.quantity}x {item.dish?.name || 'Unknown Item'}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                ${formatPrice(item.price * item.quantity)}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Order Total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Total
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            ${formatPrice(order.totalAmount)}
          </Typography>
        </Box>
        
        {/* Status Selector */}
        <FormControl fullWidth size="small">
          <Select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            sx={{ 
              '& .MuiSelect-select': { 
                display: 'flex', 
                alignItems: 'center',
                py: 1.5,
              } 
            }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1, color: getStatusColor(option.value) }}>
                    {option.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2">{option.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default Orders; 