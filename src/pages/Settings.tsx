import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  useTheme as useMuiTheme,
  Stack,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings = () => {
  const { user, updateUser, clearError } = useAuth();
  
  // Try/catch for theme context since it might not be available
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (e) {
    console.log('Theme context not available, using default light theme');
  }
  
  const muiTheme = useMuiTheme();
  const [value, setValue] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      // Add more user data initialization as needed
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleProfileUpdate = () => {
    if (user) {
      updateUser({
        firstName,
        lastName,
        email,
        phone
      });
      setSuccessMessage('Profile updated successfully!');
      setOpenSnackbar(true);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    // In a real app, you would call an API to update the password
    console.log('Password change requested');
    setSuccessMessage('Password updated successfully!');
    setOpenSnackbar(true);
    
    // Reset fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleNotificationSettingsUpdate = () => {
    // In a real app, you would save these settings to user preferences
    console.log('Notification settings updated:', { emailNotifications, smsNotifications });
    setSuccessMessage('Notification settings updated successfully!');
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ mt: 3, mb: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Account Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your account settings and preferences
        </Typography>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={value} 
              onChange={handleTabChange} 
              aria-label="settings tabs"
            >
              <Tab icon={<PersonIcon />} label="Profile" {...a11yProps(0)} />
              <Tab icon={<LockIcon />} label="Password" {...a11yProps(1)} />
              <Tab icon={<NotificationsIcon />} label="Notifications" {...a11yProps(2)} />
              <Tab icon={<PaletteIcon />} label="Appearance" {...a11yProps(3)} />
            </Tabs>
          </Box>
          
          {/* Profile Tab */}
          <TabPanel value={value} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar 
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    >
                      {firstName && lastName ? `${firstName[0]}${lastName[0]}` : 'HR'}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {firstName} {lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {user?.role || 'User'}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<UploadIcon />}
                      sx={{ mt: 2 }}
                    >
                      Upload Photo
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileUpdate}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Password Tab */}
          <TabPanel value={value} index={1}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordChange}
                >
                  Update Password
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Notifications Tab */}
          <TabPanel value={value} index={2}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Email Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Receive email notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Get email notifications for candidate applications, interview updates, and other important events.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  SMS Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                    />
                  }
                  label="Receive SMS notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Get text message alerts for urgent notifications and reminders.
                </Typography>
              </CardContent>
            </Card>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleNotificationSettingsUpdate}
            >
              Save Notification Settings
            </Button>
          </TabPanel>
          
          {/* Appearance Tab */}
          <TabPanel value={value} index={3}>
            <Typography variant="h6" gutterBottom>
              Appearance Settings
            </Typography>
            
            {themeContext ? (
              <>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        {themeContext.isDarkMode ? 
                          <DarkModeIcon sx={{ color: 'primary.main', animation: 'pulse 2s infinite ease-in-out' }} /> : 
                          <LightModeIcon sx={{ color: 'warning.main', animation: 'spin 10s linear infinite' }} />
                        }
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle1">
                          {themeContext.isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {themeContext.isDarkMode 
                            ? 'Using dark theme to reduce eye strain and save battery' 
                            : 'Using light theme for better readability in bright environments'
                          }
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Switch
                          checked={themeContext.isDarkMode}
                          onChange={themeContext.toggleDarkMode}
                          color="primary"
                          inputProps={{
                            'aria-label': 'toggle dark mode',
                          }}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#5c6bc0',
                              '&:hover': {
                                backgroundColor: 'rgba(92, 107, 192, 0.08)',
                              },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#3f51b5',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Current Theme
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        bgcolor: muiTheme.palette.background.default,
                        color: muiTheme.palette.text.primary,
                        border: `1px solid ${muiTheme.palette.divider}`,
                        mb: 2
                      }}
                    >
                      <Typography variant="body2">
                        {themeContext.isDarkMode ? 'Dark theme is currently active' : 'Light theme is currently active'}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: muiTheme.palette.primary.main, 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: muiTheme.palette.primary.contrastText,
                          fontSize: '10px'
                        }}>
                          Primary
                        </Box>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: muiTheme.palette.secondary.main, 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: muiTheme.palette.secondary.contrastText,
                          fontSize: '10px'
                        }}>
                          Secondary
                        </Box>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: muiTheme.palette.error.main, 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '10px'
                        }}>
                          Error
                        </Box>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: muiTheme.palette.success.main, 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '10px'
                        }}>
                          Success
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Theme changes are applied globally across the application.
                    </Typography>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1">
                      Theme Settings Not Available
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Theme context is not available in this view. To change theme settings,
                    please try refreshing the page or contact your administrator.
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              More Customization Options
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Additional theme customization options will be available in future updates.
            </Typography>
          </TabPanel>
        </Box>
      </Paper>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 