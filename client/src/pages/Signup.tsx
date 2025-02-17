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
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Restaurant,
  LocationOn,
  Description,
  Phone,
  AccessTime,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { SignupData, UserRole } from '../types/auth';

interface SignupFormData extends SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const { signup, error: authError } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = formData.role === 'restaurant' 
    ? ['Account Type', 'Basic Information', 'Restaurant Details'] 
    : ['Account Type', 'Basic Information'];

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent<UserRole>) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value as UserRole,
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const isStepValid = (step: number) => {
    if (step === 0) {
      return true; // Role selection is always valid
    } else if (step === 1) {
      return (
        formData.name.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.password.trim() !== '' &&
        formData.password.length >= 6
      );
    } else if (step === 2 && formData.role === 'restaurant') {
      return (
        formData.location?.trim() !== '' &&
        formData.description?.trim() !== '' &&
        formData.contactInfo?.trim() !== '' &&
        formData.timings?.trim() !== ''
      );
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.role === 'restaurant' && activeStep < 2) {
      handleNext();
      return;
    }
    
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await signup(formData);
      navigate('/');
    } catch (err) {
      setError('Signup failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>I want to join as a...</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="I want to join as a..."
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {formData.role === 'customer' 
                ? 'Join as a customer to order delicious food from restaurants near you.'
                : 'Join as a restaurant owner to showcase your menu and receive orders.'}
            </Typography>
          </FormControl>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleTextFieldChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextFieldChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleTextFieldChange}
              margin="normal"
              required
              helperText="Password must be at least 6 characters"
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
          </>
        );
      case 2:
        return (
          <>
            <TextField
              fullWidth
              label="Restaurant Address"
              name="location"
              value={formData.location || ''}
              onChange={handleTextFieldChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Restaurant Description"
              name="description"
              value={formData.description || ''}
              onChange={handleTextFieldChange}
              margin="normal"
              multiline
              rows={3}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Contact Information"
              name="contactInfo"
              value={formData.contactInfo || ''}
              onChange={handleTextFieldChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Operating Hours"
              name="timings"
              value={formData.timings || ''}
              onChange={handleTextFieldChange}
              margin="normal"
              required
              placeholder="e.g., Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTime color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80)',
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
              Create your account
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            {(error || authError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || authError}
              </Alert>
            )}
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box component="form" onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !isStepValid(activeStep)}
                  endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForward />}
                  sx={{ 
                    py: 1,
                    px: 3,
                    fontWeight: 'bold',
                    borderRadius: 2,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : activeStep === steps.length - 1 ? (
                    'Create Account'
                  ) : (
                    'Next'
                  )}
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Typography align="center" variant="body1" sx={{ mb: 2 }}>
                Already have an account?
              </Typography>
              
              <Button
                component={Link}
                to="/login"
                fullWidth
                variant="outlined"
                size="large"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Sign In
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup; 