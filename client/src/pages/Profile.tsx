import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import Form from '../components/Form';
import { useAuth } from '../contexts/AuthContext';
import { UpdateProfileData } from '../types/auth';
import { countries } from '../utils/countries';
import { states } from '../utils/states';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  location: Yup.string().test('isRestaurantLocation', 'Required for restaurants', function(value) {
    return this.parent.role !== 'restaurant' || (value !== undefined && value !== '');
  }),
  description: Yup.string().test('isRestaurantDescription', 'Required for restaurants', function(value) {
    return this.parent.role !== 'restaurant' || (value !== undefined && value !== '');
  }),
  contactInfo: Yup.string().test('isRestaurantContact', 'Required for restaurants', function(value) {
    return this.parent.role !== 'restaurant' || (value !== undefined && value !== '');
  }),
  timings: Yup.string().test('isRestaurantTimings', 'Required for restaurants', function(value) {
    return this.parent.role !== 'restaurant' || (value !== undefined && value !== '');
  }),
});

interface FormValues extends UpdateProfileData {
  name: string;
  profilePicture?: string;
  country: string;
  state: string;
  location?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
}

const Profile = () => {
  const { user, updateProfile, error } = useAuth();
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset preview when dialog closes
    if (!imageUploadOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [imageUploadOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size should be less than 5MB',
          severity: 'error'
        });
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        setSnackbar({
          open: true,
          message: 'Please select an image file',
          severity: 'error'
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      // In a real application, you would upload the image to a server/cloud storage
      // and get back a URL. For this prototype, we'll use a data URL.
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateProfile({ profilePicture: base64String });
        setImageUploadOpen(false);
        setSnackbar({
          open: true,
          message: 'Profile picture updated successfully',
          severity: 'success'
        });
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Image upload error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile picture',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await updateProfile(values);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const commonFields = [
    {
      name: 'name',
      label: 'Name',
      required: true,
    },
    {
      name: 'country',
      label: 'Country',
      type: 'select',
      options: countries.map(country => ({
        value: country.code,
        label: country.name
      })),
      required: true,
    },
    {
      name: 'state',
      label: 'State',
      type: 'select',
      options: states.map(state => ({
        value: state.abbreviation,
        label: state.name
      })),
      required: true,
    },
  ];

  const restaurantFields = [
    {
      name: 'location',
      label: 'Street Address',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      multiline: true,
      rows: 4,
      required: true,
    },
    {
      name: 'contactInfo',
      label: 'Contact Information',
      required: true,
    },
    {
      name: 'timings',
      label: 'Operating Hours',
      required: true,
    },
  ];

  const fields = user?.role === 'restaurant' ? [...commonFields, ...restaurantFields] : commonFields;

  const initialValues: FormValues = {
    name: user?.name || '',
    profilePicture: user?.profilePicture || '',
    country: user?.country || '',
    state: user?.state || '',
    location: user?.location || '',
    description: user?.description || '',
    contactInfo: user?.contactInfo || '',
    timings: user?.timings || '',
  };

  // Get state name from abbreviation
  const getStateName = (abbreviation: string) => {
    const state = states.find(s => s.abbreviation === abbreviation);
    return state ? state.name : abbreviation;
  };

  // Get country name from code
  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country ? country.name : code;
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Avatar
                    src={user?.profilePicture}
                    alt={user?.name}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mb: 2,
                      boxShadow: 3,
                      border: '4px solid white'
                    }}
                  >
                    {user?.name?.[0]}
                  </Avatar>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: -8,
                      backgroundColor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { backgroundColor: 'background.paper' },
                    }}
                    onClick={() => setImageUploadOpen(true)}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="h5" gutterBottom>
                  {user?.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                
                <Chip 
                  label={user?.role === 'restaurant' ? 'Restaurant' : 'Customer'} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
                
                <Box sx={{ mt: 3, width: '100%' }}>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" color="text.secondary" align="left">
                    Account Details
                  </Typography>
                  
                  {user?.country && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Country:
                      </Typography>
                      <Typography variant="body2">
                        {getCountryName(user.country)}
                      </Typography>
                    </Box>
                  )}
                  
                  {user?.state && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        State:
                      </Typography>
                      <Typography variant="body2">
                        {getStateName(user.state)}
                      </Typography>
                    </Box>
                  )}
                  
                  {user?.location && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Location:
                      </Typography>
                      <Typography variant="body2">
                        {user.location}
                      </Typography>
                    </Box>
                  )}
                  
                  {user?.role === 'restaurant' && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" align="left">
                        Restaurant Details
                      </Typography>
                      
                      {user?.contactInfo && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Contact:
                          </Typography>
                          <Typography variant="body2">
                            {user.contactInfo}
                          </Typography>
                        </Box>
                      )}
                      
                      {user?.timings && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Hours:
                          </Typography>
                          <Typography variant="body2">
                            {user.timings}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Edit Profile
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Form
                  title=""
                  fields={fields}
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  submitText="Save Changes"
                  error={error}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Image Upload Dialog */}
        <Dialog 
          open={imageUploadOpen} 
          onClose={() => !loading && setImageUploadOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              {previewUrl ? (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 300, 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    mb: 2, 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    borderRadius: '8px'
                  }}
                >
                  <Typography color="text.secondary">
                    No image selected
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="contained" 
                component="label"
                fullWidth
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Max file size: 5MB. Supported formats: JPG, PNG, GIF
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setImageUploadOpen(false)} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImageUpload} 
              variant="contained" 
              disabled={!selectedFile || loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Profile; 