import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from '@mui/material';
import {
  Refresh,
  FilterList,
  Search as SearchIcon,
  LocalShipping,
  AccessTime,
  Receipt,
  Restaurant as RestaurantIcon,
  LocalDining,
  CheckCircle,
  Cancel,
  Timeline,
  LocationOn,
  Phone,
  Info,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { Order } from '../../types/order';
import * as customerService from '../../services/customer.service';

// Helper function to format price
const formatPrice = (price: any): string => {
  // Convert price to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  // Check if it's a valid number
  return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
};

// Order status steps for the stepper
const orderStatusSteps = [
  { status: 'New', label: 'Order Placed', icon: <Receipt /> },
  { status: 'Order Received', label: 'Order Received', icon: <Receipt /> },
  { status: 'Preparing', label: 'Preparing', icon: <LocalDining /> },
  { status: 'On the Way', label: 'On the Way', icon: <LocalShipping /> },
  { status: 'Delivered', label: 'Delivered', icon: <CheckCircle /> },
];

// Pickup status steps
const pickupStatusSteps = [
  { status: 'New', label: 'Order Placed', icon: <Receipt /> },
  { status: 'Order Received', label: 'Order Received', icon: <Receipt /> },
  { status: 'Preparing', label: 'Preparing', icon: <LocalDining /> },
  { status: 'Pick-up Ready', label: 'Ready for Pickup', icon: <RestaurantIcon /> },
  { status: 'Picked Up', label: 'Picked Up', icon: <CheckCircle /> },
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
      const data = await customerService.getCustomerOrders();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
      case 'Order Received':
        return <Receipt />;
      case 'Preparing':
        return <LocalDining />;
      case 'On the Way':
        return <LocalShipping />;
      case 'Pick-up Ready':
        return <RestaurantIcon />;
      case 'Delivered':
      case 'Picked Up':
        return <CheckCircle />;
      case 'Cancelled':
        return <Cancel />;
      default:
        return <Info />;
    }
  };

  const getActiveStep = (order: Order) => {
    const steps = order.status.includes('Pick') ? pickupStatusSteps : orderStatusSteps;
    
    if (order.status === 'Cancelled') {
      return -1; // Special case for cancelled orders
    }
    
    // Find the index of the current status or the closest previous status
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].status === order.status) {
        return i;
      }
    }
    
    // If status doesn't match exactly, find the closest previous status
    if (order.status === 'On the Way') {
      return 3; // Index of 'On the Way' in orderStatusSteps
    }
    
    return 0; // Default to first step
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
      (order.restaurant?.name && order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

  // Calculate active orders (not delivered/picked up/cancelled)
  const activeOrdersCount = orders.filter(order => 
    !['Delivered', 'Picked Up', 'Cancelled'].includes(order.status)
  ).length;

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
              My Orders
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track and manage your food orders
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
                    <AccessTime />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Active Orders
                    </Typography>
                    <Typography variant="h6">
                      {activeOrdersCount}
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
                  placeholder="Search by order number or restaurant name..."
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
              <Tab 
                value="New" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Receipt sx={{ mr: 1 }} />
                    <Typography>New</Typography>
                    {orderStats['New'] > 0 && (
                      <Chip 
                        size="small" 
                        label={orderStats['New']} 
                        color="primary"
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    )}
                  </Box>
                } 
              />
              <Tab 
                value="Preparing" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalDining sx={{ mr: 1 }} />
                    <Typography>Preparing</Typography>
                    {orderStats['Preparing'] > 0 && (
                      <Chip 
                        size="small" 
                        label={orderStats['Preparing']} 
                        color="warning"
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    )}
                  </Box>
                } 
              />
              <Tab 
                value="On the Way" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalShipping sx={{ mr: 1 }} />
                    <Typography>On the Way</Typography>
                    {orderStats['On the Way'] > 0 && (
                      <Chip 
                        size="small" 
                        label={orderStats['On the Way']} 
                        color="info"
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    )}
                  </Box>
                } 
              />
              <Tab 
                value="Delivered" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    <Typography>Delivered</Typography>
                    {orderStats['Delivered'] > 0 && (
                      <Chip 
                        size="small" 
                        label={orderStats['Delivered']} 
                        color="success"
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    )}
                  </Box>
                } 
              />
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
                  'You haven\'t placed any orders yet'}
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
              ) : (
                <Button 
                  variant="contained" 
                  component="a" 
                  href="/customer/dashboard"
                  startIcon={<RestaurantIcon />}
                >
                  Browse Restaurants
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sortedOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                  <OrderCard 
                    order={order} 
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    getActiveStep={getActiveStep}
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
  getStatusColor: (status: string) => 'primary' | 'warning' | 'info' | 'success' | 'error' | 'default';
  getStatusIcon: (status: string) => JSX.Element;
  getActiveStep: (order: Order) => number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, getStatusColor, getStatusIcon, getActiveStep }) => {
  const theme = useTheme();
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);
  const activeStep = getActiveStep(order);
  const [expanded, setExpanded] = useState(false);
  
  // Determine if this is a delivery or pickup order
  const isDelivery = !order.status.includes('Pick');
  const steps = isDelivery ? orderStatusSteps : pickupStatusSteps;
  
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
        
        {/* Restaurant Info */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <RestaurantIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              {order.restaurant?.name || 'Unknown Restaurant'}
            </Typography>
          </Box>
          {order.restaurant?.location && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {order.restaurant.location}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Order Status */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Order Status
            </Typography>
            <Chip 
              label={order.status} 
              color={statusColor}
              size="small"
              icon={statusIcon}
            />
          </Box>
          
          {order.status !== 'Cancelled' ? (
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel 
              sx={{ 
                mt: 2,
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                },
              }}
            >
              {steps.map((step) => (
                <Step key={step.status}>
                  <StepLabel 
                    StepIconProps={{
                      icon: step.icon,
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                bgcolor: 'error.light', 
                color: 'error.dark',
                p: 1,
                mt: 1,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cancel sx={{ mr: 1, fontSize: '1rem' }} />
              <Typography variant="body2">
                This order has been cancelled
              </Typography>
            </Paper>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Order Items */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Order Items
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              color="primary"
            >
              {expanded ? <ArrowBack fontSize="small" /> : <ArrowForward fontSize="small" />}
            </IconButton>
          </Box>
          
          <Box sx={{ 
            maxHeight: expanded ? 'none' : 80, 
            overflow: expanded ? 'visible' : 'hidden',
            transition: 'max-height 0.3s ease-in-out',
          }}>
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
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Order Total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Total
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            ${formatPrice(order.totalAmount)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Orders; 