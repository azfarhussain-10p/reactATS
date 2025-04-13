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
  ChevronLeft as ChevronLeftIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AccessibilitySettings } from './AccessibilityMenu';
import AccessibilityMenu from './AccessibilityMenu';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { announce } from './ScreenReaderAnnouncer';

const drawerWidth = 240;
const collapsedDrawerWidth = 60;

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const isMenuOpen = Boolean(userMenuAnchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    announce(mobileOpen ? "Navigation menu closed" : "Navigation menu opened");
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    announce(sidebarCollapsed ? "Sidebar expanded" : "Sidebar collapsed");
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
    { text: 'Job Board', icon: <WorkIcon />, path: '/job-openings', ariaLabel: 'Navigate to job board' },
    { text: 'Interviews', icon: <EventIcon />, path: '/interviews', ariaLabel: 'Navigate to interview scheduler' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', ariaLabel: 'Navigate to analytics dashboard' },
    { text: 'Reports', icon: <PieChartIcon />, path: '/reports', ariaLabel: 'Navigate to reports' },
    { text: 'Documents', icon: <DescriptionIcon />, path: '/document-sharing', ariaLabel: 'Navigate to document sharing' },
  ];

  const handleAccessibilityChange = (newSettings: AccessibilitySettings) => {
    onAccessibilityChange(newSettings);
    announce("Accessibility settings updated");
  };

  const handleNavigation = (path: string) => {
    // This function ensures navigation works consistently across the app
    navigate(path);
    
    // Close mobile drawer if open
    if (mobileOpen) {
      setMobileOpen(false);
    }
    
    // Announce the navigation for screen readers
    const pageName = navigationItems.find(item => item.path === path)?.text || 'Page';
    announce(`Navigated to ${pageName}`);
  };

  const drawer = (
    <div role="navigation" aria-label="Main navigation">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {!sidebarCollapsed && (
          <Typography variant="h6" noWrap component="div">
            ATS Dashboard
          </Typography>
        )}
        <IconButton 
          onClick={handleToggleSidebar} 
          size="small"
          sx={{ ml: sidebarCollapsed ? 0 : 'auto' }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarCollapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarCollapsed ? 'auto' : 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText primary={item.text} />
                )}
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
          width: { 
            sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` 
          },
          ml: { 
            sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` 
          },
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
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
        sx={{ 
          width: { 
            sm: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth 
          }, 
          flexShrink: { sm: 0 }, 
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              overflowX: 'hidden',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
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
          width: { 
            xs: '100%', 
            md: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` 
          },
          mt: { xs: '56px', sm: '64px' },
          overflow: 'auto',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
        id="main-content"
        tabIndex={-1}
      >
        <Outlet />
      </Box>
    </Box>
  );
} 