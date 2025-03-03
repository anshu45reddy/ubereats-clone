import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Link } from '@mui/material';
import * as Yup from 'yup';
import Form from '../components/Form';
import { useAuth } from '../contexts/AuthContext';
import { SignupData } from '../types/auth';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
  role: Yup.string().oneOf(['customer', 'restaurant']).required('Required'),
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

const Signup = () => {
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: SignupData) => {
    try {
      await signup(values);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const commonFields = [
    {
      name: 'name',
      label: 'Name',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'customer', label: 'Customer' },
        { value: 'restaurant', label: 'Restaurant' },
      ],
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Form
        title="Create your UberEATS Account"
        fields={[...commonFields, ...restaurantFields]}
        initialValues={{
          name: '',
          email: '',
          password: '',
          role: 'customer',
          location: '',
          description: '',
          contactInfo: '',
          timings: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        submitText="Sign Up"
        error={error}
      />
      <Typography align="center" sx={{ mt: 2 }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Login
        </Link>
      </Typography>
    </Box>
  );
};

export default Signup; 