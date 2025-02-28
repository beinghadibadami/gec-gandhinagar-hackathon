import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';

const specializations = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
];
const languages = ['English', 'Hindi', 'Gujarati', 'Spanish', 'French'];

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  specialization: Yup.array()
    .min(1, 'At least one specialization is required')
    .required('Required'),
  languages: Yup.array().min(1, 'At least one language is required').required('Required'),
  experience: Yup.number()
    .min(0, 'Experience cannot be negative')
    .required('Experience is required'),
});

const AuthRegister = () => {
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      specialization: [],
      languages: [],
      experience: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post('/doctor/register', values);
        alert(response.data.message || 'Registration successful!');
      } catch (error) {
        alert(error.response?.data?.message || 'Registration failed!');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        fullWidth
        label="First Name"
        name="firstName"
        value={formik.values.firstName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
        helperText={formik.touched.firstName && formik.errors.firstName}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Last Name"
        name="lastName"
        value={formik.values.lastName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
        helperText={formik.touched.lastName && formik.errors.lastName}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Experience (years)"
        name="experience"
        type="number"
        value={formik.values.experience}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.experience && Boolean(formik.errors.experience)}
        helperText={formik.touched.experience && formik.errors.experience}
        margin="normal"
      />

      <FormControl
        fullWidth
        margin="normal"
        error={formik.touched.specialization && Boolean(formik.errors.specialization)}
      >
        <InputLabel>Specialization</InputLabel>
        <Select
          multiple
          name="specialization"
          value={formik.values.specialization}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          {specializations.map((spec) => (
            <MenuItem key={spec} value={spec}>
              {spec}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formik.touched.specialization && formik.errors.specialization}
        </FormHelperText>
      </FormControl>

      <FormControl
        fullWidth
        margin="normal"
        error={formik.touched.languages && Boolean(formik.errors.languages)}
      >
        <InputLabel>Languages</InputLabel>
        <Select
          multiple
          name="languages"
          value={formik.values.languages}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          {languages.map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{formik.touched.languages && formik.errors.languages}</FormHelperText>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? 'Registering...' : 'Register'}
      </Button>
    </form>
  );
};

export default AuthRegister;
