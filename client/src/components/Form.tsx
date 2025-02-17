import React from 'react';
import { Formik, Form as FormikForm, Field, FieldProps } from 'formik';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';

interface SelectOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  options?: SelectOption[];
}

interface FormProps {
  title: string;
  fields: FormField[];
  initialValues: Record<string, any>;
  validationSchema: any;
  onSubmit: (values: any) => Promise<void>;
  submitText: string;
  error?: string | null;
}

const Form: React.FC<FormProps> = ({
  title,
  fields,
  initialValues,
  validationSchema,
  onSubmit,
  submitText,
  error,
}) => {
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        {title}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error('Form submission error:', error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, values, handleChange, handleBlur, errors, touched }) => (
          <FormikForm>
            {fields.map((field) => {
              if (field.type === 'select' && field.options) {
                return (
                  <FormControl 
                    key={field.name} 
                    fullWidth 
                    margin="normal"
                    error={touched[field.name] && Boolean(errors[field.name])}
                  >
                    <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                    <Select
                      labelId={`${field.name}-label`}
                      id={field.name}
                      name={field.name}
                      value={values[field.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label={field.label}
                      required={field.required}
                    >
                      <MenuItem value="">
                        <em>Select {field.label}</em>
                      </MenuItem>
                      {field.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched[field.name] && errors[field.name] && (
                      <FormHelperText>{errors[field.name] as string}</FormHelperText>
                    )}
                  </FormControl>
                );
              }
              
              return (
                <Field key={field.name} name={field.name}>
                  {({ field: fieldProps, meta }: FieldProps) => (
                    <TextField
                      {...fieldProps}
                      label={field.label}
                      type={field.type || 'text'}
                      required={field.required}
                      multiline={field.multiline}
                      rows={field.rows}
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      fullWidth
                      margin="normal"
                    />
                  )}
                </Field>
              );
            })}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : submitText}
            </Button>
          </FormikForm>
        )}
      </Formik>
    </Box>
  );
};

export default Form; 