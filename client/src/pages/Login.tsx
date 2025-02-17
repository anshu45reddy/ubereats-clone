import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  SelectChangeEvent,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Restaurant } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { LoginData } from '../types/auth';

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoginData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent<'customer' | 'restaurant'>) => {
    setFormData((prev: LoginData) => ({
      ...prev,
      role: e.target.value as 'customer' | 'restaurant',
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper 
          elevation={10}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 3, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              UberEATS
            </Typography>
            <Typography variant="subtitle1">
              Sign in to continue
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            {(error || authError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || authError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
                autoFocus
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>I am a...</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="I am a..."
                  onChange={handleRoleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      {formData.role === 'customer' ? (
                        <Person color="primary" />
                      ) : (
                        <Restaurant color="primary" />
                      )}
                    </InputAdornment>
                  }
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="restaurant">Restaurant Owner</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 4, 
                  mb: 2, 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Typography align="center" variant="body1" sx={{ mb: 2 }}>
                Don't have an account?
              </Typography>
              
              <Button
                component={Link}
                to="/signup"
                fullWidth
                variant="outlined"
                size="large"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 