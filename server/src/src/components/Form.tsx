import React from 'react';
import { Formik, Form as FormikForm, Field, FieldProps } from 'formik';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';

interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
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
        {({ isSubmitting }) => (
          <FormikForm>
            {fields.map((field) => (
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
            ))}
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