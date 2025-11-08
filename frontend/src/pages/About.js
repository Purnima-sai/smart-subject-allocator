import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar, useTheme } from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const About = () => {
  const theme = useTheme();

  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Academic Officer',
      avatar: 'SJ',
      bio: 'Education technology expert with 15+ years of experience in academic management systems.',
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      avatar: 'MC',
      bio: 'Full-stack developer specializing in building scalable educational platforms.',
    },
    {
      name: 'Priya Patel',
      role: 'UX/UI Designer',
      avatar: 'PP',
      bio: 'Passionate about creating intuitive user experiences for educational technology.',
    },
  ];

  const stats = [
    { number: '50+', label: 'Institutions' },
    { number: '500K+', label: 'Students Served' },
    { number: '98%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Support' },
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
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            About SSAEMS
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.9 }}>
            Revolutionizing the way educational institutions manage elective subject allocations
            through technology and innovation.
          </Typography>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3, fontSize: '1.1rem' }}>
                At SSAEMS, we believe in making academic administration more efficient, transparent,
                and student-centered. Our mission is to provide educational institutions with a
                robust platform that simplifies the complex process of subject allocation while
                ensuring fairness and transparency.
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3, fontSize: '1.1rem' }}>
                We understand the challenges faced by academic coordinators and students during the
                elective allocation process, and we\'re committed to providing a solution that saves
                time, reduces errors, and improves overall satisfaction.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.light',
                  color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.contrastText',
                }}
              >
                <SchoolIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Empowering Education
                </Typography>
                <Typography variant="body1">
                  We\'re dedicated to creating tools that enhance the educational experience for
                  institutions, faculty, and students alike.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Our Core Values
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" maxWidth="700px" mx="auto">
              These principles guide everything we do at SSAEMS
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <SecurityIcon sx={{ fontSize: 40 }} color="primary" />,
                title: 'Integrity',
                description:
                  'We maintain the highest standards of honesty and transparency in all our interactions.',
              },
              {
                icon: <GroupIcon sx={{ fontSize: 40 }} color="primary" />,
                title: 'Collaboration',
                description:
                  'We believe in working together with educational institutions to create the best solutions.',
              },
              {
                icon: <EmojiEventsIcon sx={{ fontSize: 40 }} color="primary" />,
                title: 'Excellence',
                description:
                  'We\'re committed to delivering high-quality, reliable, and innovative solutions.',
              },
            ].map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                    },
                  }}
                >
                  <Box mb={2}>{value.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Meet Our Team
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" maxWidth="700px" mx="auto">
              The passionate individuals behind SSAEMS
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
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
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '2.5rem',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      mb: 3,
                    }}
                  >
                    {member.avatar}
                  </Avatar>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {member.name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    gutterBottom
                    sx={{ fontWeight: 500, mb: 2 }}
                  >
                    {member.role}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {member.bio}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index} textAlign="center">
                <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.number}
                </Typography>
                <Typography variant="subtitle1">{stat.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
