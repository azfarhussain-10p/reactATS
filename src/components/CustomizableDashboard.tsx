import React, { useState, useEffect } from 'react';
import { useAdvancedDashboard } from '../contexts/AdvancedDashboardContext';
import { Grid, Paper, Typography, Button, Menu, MenuItem, Box, CircularProgress, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import NumbersIcon from '@mui/icons-material/Numbers';

// Mock component for chart visualization
const ChartWidget: React.FC<{
  title: string;
  type: string;
  size: string;
  data: any;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ title, type, size, data, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Determine the height based on size
  const getHeight = () => {
    switch (size) {
      case 'small': return 150;
      case 'medium': return 250;
      case 'large': return 350;
      default: return 250;
    }
  };
  
  // Render appropriate chart icon based on type
  const renderChartIcon = () => {
    switch (type) {
      case 'bar': return <BarChartIcon fontSize="large" />;
      case 'line': return <ShowChartIcon fontSize="large" />;
      case 'pie': return <PieChartIcon fontSize="large" />;
      case 'table': return <TableChartIcon fontSize="large" />;
      case 'metric': return <NumbersIcon fontSize="large" />;
      default: return <BarChartIcon fontSize="large" />;
    }
  };
  
  return (
    <Paper sx={{ p: 2, height: getHeight(), display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Button 
          size="small" 
          onClick={handleMenuOpen}
          sx={{ minWidth: 'auto' }}
        >
          <MoreVertIcon />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { handleMenuClose(); onEdit(); }}>Edit</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); onDelete(); }}>Delete</MenuItem>
          <MenuItem onClick={handleMenuClose}>Download</MenuItem>
          <MenuItem onClick={handleMenuClose}>View Full Screen</MenuItem>
        </Menu>
      </Box>
      
      {/* Chart visualization placeholder */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}>
        {renderChartIcon()}
      </Box>
    </Paper>
  );
};

// Customizable Dashboard component
const CustomizableDashboard: React.FC = () => {
  const { 
    dashboards, 
    selectedDashboardId, 
    setSelectedDashboardId, 
    createDashboard, 
    addWidget, 
    updateWidget, 
    removeWidget,
    userRole,
    canEdit
  } = useAdvancedDashboard();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [dashboardTabs, setDashboardTabs] = useState<Array<{ id: string, name: string }>>([]);
  
  // Set up dashboard tabs based on user role
  useEffect(() => {
    if (dashboards.length > 0) {
      const userDashboards = dashboards
        .filter(d => d.allowedRoles.includes(userRole))
        .map(d => ({ id: d.id, name: d.name }));
      
      setDashboardTabs(userDashboards);
      
      // Select the first dashboard if none is selected
      if (!selectedDashboardId && userDashboards.length > 0) {
        setSelectedDashboardId(userDashboards[0].id);
      }
    }
  }, [dashboards, userRole, selectedDashboardId, setSelectedDashboardId]);
  
  // Get the current dashboard
  const currentDashboard = dashboards.find(d => d.id === selectedDashboardId);
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedDashboardId(newValue);
  };
  
  // Handle adding a new widget
  const handleAddWidget = async () => {
    if (!currentDashboard) return;
    
    setIsLoading(true);
    
    // Mock adding a new widget
    try {
      await addWidget(currentDashboard.id, {
        title: 'New Widget',
        type: 'chart',
        chartType: 'bar',
        size: 'medium',
        dataSource: 'mock_data',
        parameters: {}
      });
      
      setIsAddingWidget(false);
    } catch (error) {
      console.error('Error adding widget:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle editing a widget
  const handleEditWidget = (widgetId: string) => {
    console.log('Editing widget:', widgetId);
    // This would open a widget editor dialog in a real implementation
  };
  
  // Handle deleting a widget
  const handleDeleteWidget = async (widgetId: string) => {
    if (!currentDashboard) return;
    
    setIsLoading(true);
    
    try {
      await removeWidget(currentDashboard.id, widgetId);
    } catch (error) {
      console.error('Error removing widget:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new dashboard
  const handleAddDashboard = async () => {
    setIsLoading(true);
    
    try {
      await createDashboard({
        name: 'New Dashboard',
        description: 'Custom dashboard',
        widgets: [],
        allowedRoles: [userRole],
        createdBy: 'current_user'
      });
    } catch (error) {
      console.error('Error creating dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (dashboardTabs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>No dashboards available</Typography>
        {canEdit && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddDashboard}
          >
            Create Dashboard
          </Button>
        )}
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Dashboard selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs 
          value={selectedDashboardId} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {dashboardTabs.map((tab) => (
            <Tab key={tab.id} value={tab.id} label={tab.name} />
          ))}
        </Tabs>
        
        <Box>
          {canEdit && (
            <>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={handleAddDashboard}
                sx={{ mr: 1 }}
              >
                Dashboard
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setIsAddingWidget(true)}
                disabled={!currentDashboard}
              >
                Widget
              </Button>
            </>
          )}
          <Button sx={{ ml: 1 }} startIcon={<DownloadIcon />}>Export</Button>
          <Button sx={{ ml: 1 }} startIcon={<ShareIcon />}>Share</Button>
          {canEdit && <Button sx={{ ml: 1 }} startIcon={<SettingsIcon />}>Settings</Button>}
        </Box>
      </Box>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Dashboard widgets */}
      {currentDashboard && !isLoading && (
        <Grid container spacing={3}>
          {currentDashboard.widgets.map((widget) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={widget.id}>
              <ChartWidget
                title={widget.title}
                type={widget.type}
                size={widget.size}
                data={null} // Would be fetched from widget data in a real implementation
                onEdit={() => handleEditWidget(widget.id)}
                onDelete={() => handleDeleteWidget(widget.id)}
              />
            </Grid>
          ))}
          
          {/* Add widget placeholder */}
          {isAddingWidget && canEdit && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: 250, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px dashed #1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }}
                onClick={handleAddWidget}
              >
                <AddIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="subtitle1" color="primary">Add Widget</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default CustomizableDashboard; 