import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
} from '@mui/material';
import * as Yup from 'yup';
import Layout from '../components/Layout';
import Form from '../components/Form';
import { useAuth } from '../contexts/AuthContext';
import { UpdateProfileData, User } from '../types/auth';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  location: Yup.string().when('role', {
    is: 'restaurant',
    then: Yup.string().required('Required for restaurants'),
  }),
  description: Yup.string().when('role', {
    is: 'restaurant',
    then: Yup.string().required('Required for restaurants'),
  }),
  contactInfo: Yup.string().when('role', {
    is: 'restaurant',
    then: Yup.string().required('Required for restaurants'),
  }),
  timings: Yup.string().when('role', {
    is: 'restaurant',
    then: Yup.string().required('Required for restaurants'),
  }),
});

interface FormValues extends UpdateProfileData {
  name: string;
  profilePicture?: string;
  location?: string;
  description?: string;
  contactInfo?: string;
  timings?: string;
}

const Profile = () => {
  const { user, updateProfile, error } = useAuth();

  const handleSubmit = async (values: FormValues) => {
    try {
      await updateProfile(values);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const commonFields = [
    {
      name: 'name',
      label: 'Name',
      required: true,
    },
    {
      name: 'profilePicture',
      label: 'Profile Picture URL',
      type: 'url',
    },
  ];

  const restaurantFields = [
    {
      name: 'location',
      label: 'Location',
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
    location: user?.location || '',
    description: user?.description || '',
    contactInfo: user?.contactInfo || '',
    timings: user?.timings || '',
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Avatar
                  src={user?.profilePicture}
                  alt={user?.name}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {user?.name?.[0]}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {user?.role}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Form
                  title="Edit Profile"
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
      </Box>
    </Layout>
  );
};

export default Profile; 