import React from 'react';
import { Box, Container, Typography, Grid, Paper, useTheme, useMediaQuery } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Lightbulb as LightbulbIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  GroupWork as GroupWorkIcon,
  NotificationsActive as NotificationsActiveIcon,
  Dashboard as DashboardIcon,
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

const Features = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <AutoAwesomeIcon fontSize="large" color="primary" />,
      title: 'Smart Allocation Algorithm',
      description:
        'Our intelligent algorithm ensures fair and efficient subject allocation based on student preferences, academic performance, and seat availability.',
    },
    {
      icon: <TimelineIcon fontSize="large" color="primary" />,
      title: 'Real-time Tracking',
      description:
        'Monitor allocation status, seat availability, and student preferences in real-time with our intuitive dashboard.',
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Secure Access Control',
      description:
        'Role-based access ensures that students, faculty, and administrators only see and interact with relevant information.',
    },
    {
      icon: <PeopleIcon fontSize="large" color="primary" />,
      title: 'Comprehensive User Management',
      description:
        'Easily manage students, faculty, and administrative users with our user-friendly interface.',
    },
    {
      icon: <AssignmentIcon fontSize="large" color="primary" />,
      title: 'Automated Reporting',
      description:
        'Generate detailed reports on allocations, student preferences, and course demand with just a few clicks.',
    },
    {
      icon: <LightbulbIcon fontSize="large" color="primary" />,
      title: 'Intuitive Interface',
      description:
        'Designed with user experience in mind, our platform is easy to navigate for both technical and non-technical users.',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Upload Student Data',
      description: 'Administrators upload student information and course details via CSV.',
      icon: <CloudUploadIcon />,
    },
    {
      step: '2',
      title: 'Set Preferences',
      description: 'Students log in and submit their subject preferences in order of priority.',
      icon: <CheckCircleIcon />,
    },
    {
      step: '3',
      title: 'Run Allocation',
      description: 'The system processes preferences and allocates subjects fairly based on merit and availability.',
      icon: <GroupWorkIcon />,
    },
    {
      step: '4',
      title: 'Review & Export',
      description: 'Administrators review the allocations and export the final results.',
      icon: <AssessmentIcon />,
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
            Powerful Features for Seamless Elective Management
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.9 }}>
            Discover how our platform transforms the way educational institutions handle subject
            allocations.
          </Typography>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-5px)',
                      transition: 'all 0.3s ease-in-out',
                    },
                  }}
                >
                  <Box mb={2}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              How It Works
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" maxWidth="700px" mx="auto">
              Our streamlined process makes subject allocation simple and efficient
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="center">
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>
                    {step.description}
                  </Typography>
                  <Typography
                    variant="h1"
                    component="div"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontSize: '5rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                      zIndex: 0,
                    }}
                  >
                    {step.step}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/benefits-illustration.svg"
                alt="Benefits illustration"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: 500,
                  display: 'block',
                  mx: 'auto',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                Why Choose Our Platform?
              </Typography>

              {[
                {
                  icon: <DashboardIcon color="primary" />,
                  title: 'Centralized Dashboard',
                  description:
                    'Get a comprehensive overview of all allocation activities from a single, intuitive dashboard.',
                },
                {
                  icon: <LockIcon color="primary" />,
                  title: 'Secure & Private',
                  description:
                    'Enterprise-grade security measures to protect sensitive student and institutional data.',
                },
                {
                  icon: <NotificationsActiveIcon color="primary" />,
                  title: 'Automated Notifications',
                  description:
                    'Keep all stakeholders informed with automated email and in-app notifications.',
                },
              ].map((benefit, index) => (
                <Box key={index} display="flex" mb={3}>
                  <Box mr={2} mt={0.5}>
                    {benefit.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to experience the future of subject allocation?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            Join leading educational institutions that trust our platform for their elective
            management needs.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Features;
