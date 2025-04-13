import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Box,
  Tooltip,
  IconButton,
  Slider,
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  TextFields as TextFieldsIcon,
  FormatColorFill as FormatColorFillIcon,
  Speed as SpeedIcon,
  KeyboardTab as KeyboardTabIcon,
} from '@mui/icons-material';

// Define accessibility settings interface
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardFocusVisible: boolean;
  fontSizeMultiplier: number;
}

interface AccessibilityMenuProps {
  onChange: (settings: AccessibilitySettings) => void;
  initialSettings?: Partial<AccessibilitySettings>;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  keyboardFocusVisible: true,
  fontSizeMultiplier: 1,
};

/**
 * A reusable menu that provides accessibility options for the application
 */
const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ 
  onChange, 
  initialSettings = {} 
}) => {
  // Merge initial settings with defaults
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Apply changes when settings change
  useEffect(() => {
    onChange(settings);
    
    // Save settings to localStorage for persistence
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Update CSS variables for global settings
    document.documentElement.style.setProperty(
      '--font-size-multiplier', 
      settings.fontSizeMultiplier.toString()
    );
    
    document.documentElement.style.setProperty(
      '--transition-duration', 
      settings.reducedMotion ? '0s' : '0.3s'
    );
    
    // Add/remove classes for global settings
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    if (settings.largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    
    if (settings.keyboardFocusVisible) {
      document.body.classList.add('keyboard-focus-visible');
    } else {
      document.body.classList.remove('keyboard-focus-visible');
    }
  }, [settings, onChange]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+A opens accessibility menu
      if (e.altKey && e.key === 'a') {
        if (open) {
          handleClose();
        } else {
          const button = document.getElementById('accessibility-button');
          if (button) {
            button.click();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleChangeSetting = (key: keyof AccessibilitySettings) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings({
        ...settings,
        [key]: event.target.checked,
      });
    };
  };
  
  const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
    setSettings({
      ...settings,
      fontSizeMultiplier: newValue as number,
    });
  };
  
  const resetSettings = () => {
    setSettings(defaultSettings);
  };
  
  return (
    <>
      <Tooltip title="Accessibility options (Alt+A)">
        <IconButton
          id="accessibility-button"
          aria-controls={open ? 'accessibility-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          aria-label="Accessibility menu"
          color={open ? 'primary' : 'default'}
        >
          <AccessibilityIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        id="accessibility-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'accessibility-button',
          dense: false,
        }}
        PaperProps={{
          style: {
            width: '300px',
            maxWidth: '100%',
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Accessibility Settings
          </Typography>
          
          <Typography variant="caption" color="text.secondary" paragraph>
            Customize your experience with these accessibility options. Settings are saved automatically.
          </Typography>
        </Box>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FormatColorFillIcon fontSize="small" sx={{ mr: 1 }} /> Display
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.highContrast}
                onChange={handleChangeSetting('highContrast')}
                inputProps={{ 'aria-label': 'Toggle high contrast mode' }}
              />
            }
            label="High contrast"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.largeText}
                onChange={handleChangeSetting('largeText')}
                inputProps={{ 'aria-label': 'Toggle large text' }}
              />
            }
            label="Large text"
          />
          
          <Box sx={{ px: 1, mt: 1 }}>
            <Typography id="font-size-slider-label" gutterBottom variant="body2">
              Text size multiplier: {settings.fontSizeMultiplier.toFixed(1)}x
            </Typography>
            <Slider
              value={settings.fontSizeMultiplier}
              onChange={handleFontSizeChange}
              aria-labelledby="font-size-slider-label"
              step={0.1}
              marks
              min={0.8}
              max={1.5}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SpeedIcon fontSize="small" sx={{ mr: 1 }} /> Motion & Interactions
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.reducedMotion}
                onChange={handleChangeSetting('reducedMotion')}
                inputProps={{ 'aria-label': 'Toggle reduced motion' }}
              />
            }
            label="Reduce animations"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.keyboardFocusVisible}
                onChange={handleChangeSetting('keyboardFocusVisible')}
                inputProps={{ 'aria-label': 'Toggle keyboard focus indicators' }}
              />
            }
            label="Show keyboard focus indicators"
          />
        </Box>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={resetSettings}
            aria-label="Reset all accessibility settings to defaults"
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleClose}
          >
            Close
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default AccessibilityMenu; 