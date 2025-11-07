import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  School as SchoolIcon,
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledHero = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(8, 0),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(25, 118, 210, 0.7) 100%)',
    zIndex: 1,
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  minHeight: 220,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '& svg': {
    fontSize: 40,
  },
}));

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <AutoAwesomeIcon />,
      title: 'Smart Allocation',
      description: 'Automated subject allocation based on merit and preference.',
    },
    {
      icon: <TimelineIcon />,
      title: 'Real-time Tracking',
      description: 'Track allocation status and seat availability in real-time.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Secure Access',
      description: 'Role-based access control ensures data security and privacy.',
    },
    {
      icon: <PeopleIcon />,
      title: 'User Management',
      description: 'Easy management of students, faculty, and administrators.',
    },
    {
      icon: <AssignmentIcon />,
      title: 'Automated Reports',
      description: 'Generate reports, analytics on allocations, preferences & more.',
    },
    {
      icon: <LightbulbIcon />,
      title: 'Intuitive Interface',
      description: 'User-friendly design for seamless navigation and operation.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <StyledHero>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                Smart Subject Allocation & Elective Management System
              </Typography>
              <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                Streamline your institution's elective subject allocation process with our intelligent, 
                transparent, and efficient management system.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={RouterLink}
                  to="/features"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              
            </Grid>
          </Grid>
        </Container>
      </StyledHero>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              Key Features
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" maxWidth="700px" mx="auto">
              Our platform offers a comprehensive solution for managing elective subject allocations
              with ease and efficiency.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={index} sx={{ display: 'flex' }}>
                <FeatureCard elevation={3} sx={{ flex: 1 }}>
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to transform your institution's elective management?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of institutions already using our platform to streamline their subject
            allocation process.
          </Typography>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
