import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './contexts/AuthContext';
import theme from './theme';

// Lazy load components
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const CustomerDashboard = React.lazy(() => import('./pages/customer/Dashboard'));
const RestaurantDashboard = React.lazy(() => import('./pages/restaurant/Dashboard'));
const RestaurantMenu = React.lazy(() => import('./pages/restaurant/Menu'));
const RestaurantOrders = React.lazy(() => import('./pages/restaurant/Orders'));
const CustomerOrders = React.lazy(() => import('./pages/customer/Orders'));
const CustomerFavorites = React.lazy(() => import('./pages/customer/Favorites'));
const Profile = React.lazy(() => import('./pages/Profile'));
const RestaurantDetails = React.lazy(() => import('./pages/customer/RestaurantDetails'));

const LoadingScreen = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
);

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/signup"
              element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />}
            />

            {/* Root Route - Redirect based on role */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  user?.role === 'customer' ? (
                    <Navigate to="/customer/dashboard" replace />
                  ) : (
                    <Navigate to="/restaurant/dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                isAuthenticated && user?.role === 'customer' ? (
                  <CustomerDashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/restaurants/:id"
              element={
                isAuthenticated && user?.role === 'customer' ? (
                  <RestaurantDetails />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/customer/orders"
              element={
                isAuthenticated && user?.role === 'customer' ? (
                  <CustomerOrders />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/customer/favorites"
              element={
                isAuthenticated && user?.role === 'customer' ? (
                  <CustomerFavorites />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Restaurant Routes */}
            <Route
              path="/restaurant/dashboard"
              element={
                isAuthenticated && user?.role === 'restaurant' ? (
                  <RestaurantDashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/restaurant/menu"
              element={
                isAuthenticated && user?.role === 'restaurant' ? (
                  <RestaurantMenu />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/restaurant/orders"
              element={
                isAuthenticated && user?.role === 'restaurant' ? (
                  <RestaurantOrders />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Common Routes */}
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
