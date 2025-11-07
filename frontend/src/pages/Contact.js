import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setOpenSnackbar(true);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const contactInfo = [
    {
      icon: <LocationOnIcon color="primary" fontSize="large" />,
      title: 'Our Location',
      description: '123 Education Street, Tech Park, Bangalore, Karnataka, 560001',
    },
    {
      icon: <EmailIcon color="primary" fontSize="large" />,
      title: 'Email Us',
      description: 'support@ssaems.com',
    },
    {
      icon: <PhoneIcon color="primary" fontSize="large" />,
      title: 'Call Us',
      description: '+91 98765 43210',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Get in Touch
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.9 }}>
            Have questions or feedback? We'd love to hear from you.
          </Typography>
        </Container>
      </Box>

      {/* Contact Form & Info */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Contact Form */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                  Send us a Message
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Your Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        multiline
                        rows={6}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        endIcon={<SendIcon />}
                        sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    mb: { xs: 4, md: 0 },
                  }}
                >
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                    Contact Information
                  </Typography>
                  
                  <Box sx={{ '& > div:not(:last-child)': { mb: 4 } }}>
                    {contactInfo.map((info, index) => (
                      <Box key={index} display="flex" alignItems="flex-start">
                        <Box mr={2} mt={0.5}>
                          {info.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {info.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {info.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 4 }} />
                  
                  <Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                      Office Hours
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Monday - Friday: 9:00 AM - 6:00 PM
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Saturday: 10:00 AM - 2:00 PM
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Map Section */}
      <Box sx={{ height: '400px', width: '100%', bgcolor: 'grey.200' }}>
        <iframe
          title="Our Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.014888564057!2d77.5945143148219!3d12.97199799085679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBangalore%20Palace!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </Box>

      {/* Success Message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
          }}
          sx={{ width: '100%' }}
        >
          Your message has been sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
