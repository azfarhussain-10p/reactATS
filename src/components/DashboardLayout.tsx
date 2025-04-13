import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Theme,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Accessibility as AccessibilityIcon,
  Keyboard as KeyboardIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AccessibilitySettings } from './AccessibilityMenu';
import AccessibilityMenu from './AccessibilityMenu';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { announce } from './ScreenReaderAnnouncer';

const drawerWidth = 240;

interface DashboardLayoutProps {
  accessibilitySettings?: AccessibilitySettings;
  onAccessibilityChange?: (settings: AccessibilitySettings) => void;
}

export default function DashboardLayout({ 
  accessibilitySettings, 
  onAccessibilityChange = () => {} 
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const isMenuOpen = Boolean(userMenuAnchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    announce(mobileOpen ? "Navigation menu closed" : "Navigation menu opened");
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
    announce("You have been logged out");
  };

  const handleSettingsClick = () => {
    handleUserMenuClose();
    announce("Settings opened");
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', ariaLabel: 'Navigate to dashboard' },
    { text: 'Candidates', icon: <PersonIcon />, path: '/candidates', ariaLabel: 'Navigate to candidates list' },
    { text: 'Job Board', icon: <WorkIcon />, path: '/jobs', ariaLabel: 'Navigate to job board' },
    { text: 'Interviews', icon: <EventIcon />, path: '/interviews', ariaLabel: 'Navigate to interview scheduler' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', ariaLabel: 'Navigate to reports and analytics' },
    { text: 'Documents', icon: <DescriptionIcon />, path: '/document-sharing', ariaLabel: 'Navigate to document sharing' },
  ];

  const handleAccessibilityChange = (newSettings: AccessibilitySettings) => {
    onAccessibilityChange(newSettings);
    announce("Accessibility settings updated");
  };

  const drawer = (
    <div role="navigation" aria-label="Main navigation">
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          ATS Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={isActive}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Applicant Tracking System
          </Typography>
          
          <Box sx={{ display: 'flex', mr: 2 }}>
            <AccessibilityMenu 
              onChange={handleAccessibilityChange} 
              initialSettings={accessibilitySettings} 
            />
            <KeyboardShortcutsHelp />
          </Box>
          
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              edge="end"
              aria-label="User account menu"
              aria-controls={isMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>HR</Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchorEl}
            open={isMenuOpen}
            onClose={handleUserMenuClose}
            MenuListProps={{
              'aria-labelledby': 'user-menu-button',
            }}
          >
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '64px' },
          overflow: 'auto'
        }}
        id="main-content"
        tabIndex={-1}
      >
        <Outlet />
      </Box>
    </Box>
  );
} 