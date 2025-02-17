import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  ListItemButton,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as OrdersIcon,
  Favorite as FavoriteIcon,
  Person as ProfileIcon,
  Dashboard as DashboardIcon,
  MenuBook as MenuIcon2,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to check if a menu item is active
  const isActive = (path: string): boolean => {
    // Handle special cases for root path
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    
    // Special case for restaurants details page
    if (path === '/customer/dashboard' && location.pathname.startsWith('/restaurants/')) {
      return true;
    }
    
    // For other paths, check if the current path starts with the menu item path
    // This handles nested routes like /orders/123
    return path !== '/' && location.pathname.startsWith(path);
  };

  const menuItems = user?.role === 'customer'
    ? [
        { text: 'Restaurants', icon: <RestaurantIcon />, path: '/customer/dashboard' },
        { text: 'Orders', icon: <OrdersIcon />, path: '/customer/orders' },
        { text: 'Favorites', icon: <FavoriteIcon />, path: '/customer/favorites' },
        { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
      ]
    : [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/restaurant/dashboard' },
        { text: 'Menu', icon: <MenuIcon2 />, path: '/restaurant/menu' },
        { text: 'Orders', icon: <OrdersIcon />, path: '/restaurant/orders' },
        { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
      ];

  const drawer = (
    <Box>
      <Toolbar />
      <List>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.16)' 
                      : 'rgba(25, 118, 210, 0.12)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.24)' 
                        : 'rgba(25, 118, 210, 0.18)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: active ? 'primary.main' : 'inherit',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: active ? 'bold' : 'regular',
                    color: active ? 'primary.main' : 'text.primary',
                  }}
                />
                {active && (
                  <Box 
                    sx={{ 
                      width: 4, 
                      height: 32, 
                      bgcolor: 'primary.main',
                      position: 'absolute',
                      right: 0,
                      borderRadius: '4px 0 0 4px'
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            UberEATS
          </Typography>
          <IconButton
            onClick={handleMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar alt={user?.name} src={user?.profilePicture} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate('/profile');
              }}
            >
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 