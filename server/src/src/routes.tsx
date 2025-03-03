import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

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

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
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

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'customer' ? (
                <CustomerDashboard />
              ) : (
                <RestaurantDashboard />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Customer Routes */}
        <Route
          path="/orders"
          element={
            isAuthenticated && user?.role === 'customer' ? (
              <CustomerOrders />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/favorites"
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
          path="/menu"
          element={
            isAuthenticated && user?.role === 'restaurant' ? (
              <RestaurantMenu />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/restaurant-orders"
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
    </React.Suspense>
  );
};

export default AppRoutes; 