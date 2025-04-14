/**
 * AccessibilityMenu Component
 * 
 * A customizable, feature-rich accessibility menu that provides users with options
 * to adjust visual display, text size, and motion settings according to their needs.
 * 
 * Copyright (c) 2024-2025 Syed Azfar Hussain - Principal Test Consultant at 10Pearls Pakistan
 * All rights reserved.
 * 
 * Licensed under the terms of 10Pearls proprietary license.
 * Unauthorized copying, redistribution, or use of this file is strictly prohibited.
 * 
 * This component implements WCAG 2.1 guidelines for:
 * - Contrast adjustment (1.4.3 Contrast)
 * - Text resizing (1.4.4 Resize Text)
 * - Motion control (2.3.3 Animation from Interactions)
 * - Keyboard focus visibility (2.4.7 Focus Visible)
 */

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
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  TextFields as TextFieldsIcon,
  FormatColorFill as FormatColorFillIcon,
  Speed as SpeedIcon,
  KeyboardTab as KeyboardTabIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
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
 * 
 * @component
 * @author Syed Azfar Hussain - Principal Test Consultant at 10Pearls Pakistan
 * @copyright 2024-2025 10Pearls Pakistan
 * 
 * Features:
 * - High contrast mode for better visibility
 * - Large text mode for improved readability
 * - Text size multiplier with fine-grained control
 * - Reduced motion option for users sensitive to animations
 * - Keyboard focus indicators for better keyboard navigation
 * - Automatic settings persistence via localStorage
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
    const fontSizeValue = newValue as number;
    const newSettings = {
      ...settings,
      fontSizeMultiplier: fontSizeValue,
    };
    
    // Update settings in component state
    setSettings(newSettings);
    
    // Apply font size directly
    document.documentElement.style.setProperty(
      '--font-size-multiplier', 
      fontSizeValue.toString()
    );
    
    // Set an inline style on html to trigger immediate update
    if (newSettings.largeText) {
      document.documentElement.style.fontSize = `calc(1rem * ${fontSizeValue})`;
    }
    
    // Force layout reflow to apply changes immediately
    document.body.style.zoom = '99.99%';
    setTimeout(() => { document.body.style.zoom = '100%'; }, 10);
    
    // Pass changes to parent component (App) through onChange prop
    onChange(newSettings);
    
    // Log for debugging
    console.log('Font size changed:', fontSizeValue);
  };
  
  const resetSettings = () => {
    // Update settings in component state
    setSettings(defaultSettings);
    
    // Apply all settings directly
    Object.keys(defaultSettings).forEach((key) => {
      const settingKey = key as keyof AccessibilitySettings;
      if (settingKey !== 'fontSizeMultiplier') {
        applySettingDirectly(settingKey, defaultSettings[settingKey]);
      }
    });
    
    // Apply font size directly
    document.documentElement.style.setProperty(
      '--font-size-multiplier', 
      defaultSettings.fontSizeMultiplier.toString()
    );
    document.documentElement.style.fontSize = '';
    
    // Force layout reflow to apply changes immediately
    document.body.style.zoom = '99.99%';
    setTimeout(() => { document.body.style.zoom = '100%'; }, 10);
    
    // Pass changes to parent component (App) through onChange prop
    onChange(defaultSettings);
    
    // Log for debugging
    console.log('Settings reset to defaults');
  };
  
  const handleSettingChange = (key: keyof AccessibilitySettings) => {
    if (key === 'fontSizeMultiplier') {
      return; // This is handled by the slider component
    }
    
    // Toggle boolean settings
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    
    // Update settings in component state
    setSettings(newSettings);
    
    // Directly apply the changed setting
    applySettingDirectly(key, newSettings[key]);
    
    // Pass changes to parent component (App) through onChange prop
    onChange(newSettings);
    
    // Log for debugging
    console.log('Setting changed:', key, newSettings[key]);
  };
  
  // Helper function to directly apply a setting
  const applySettingDirectly = (key: keyof AccessibilitySettings, value: any) => {
    console.log(`Directly applying ${key} = ${value}`);
    
    switch(key) {
      case 'highContrast':
        if (value) {
          document.body.classList.add('high-contrast');
          document.documentElement.style.setProperty('--high-contrast-mode', '1');
        } else {
          document.body.classList.remove('high-contrast');
          document.documentElement.style.setProperty('--high-contrast-mode', '0');
        }
        break;
        
      case 'largeText':
        if (value) {
          document.body.classList.add('large-text');
          document.documentElement.style.setProperty('--large-text-mode', '1');
          // Force a font size increase immediately
          document.documentElement.style.fontSize = 'calc(1rem * var(--font-size-multiplier))';
        } else {
          document.body.classList.remove('large-text');
          document.documentElement.style.setProperty('--large-text-mode', '0');
          document.documentElement.style.fontSize = '';
        }
        break;
        
      case 'reducedMotion':
        if (value) {
          document.body.classList.add('reduced-motion');
          document.documentElement.style.setProperty('--reduced-motion', '1');
        } else {
          document.body.classList.remove('reduced-motion');
          document.documentElement.style.setProperty('--reduced-motion', '0');
        }
        break;
        
      case 'keyboardFocusVisible':
        if (value) {
          document.body.classList.add('keyboard-focus-visible');
        } else {
          document.body.classList.remove('keyboard-focus-visible');
        }
        break;
        
      default:
        break;
    }
  };
  
  // Create debug overlay to visually show what settings are active - only when triggered with keyboard shortcut
  useEffect(() => {
    // Only in development mode
    if (process.env.NODE_ENV === 'development') {
      // Remove any existing overlay when component unmounts or settings change
      const cleanup = () => {
        const existingOverlay = document.getElementById('accessibility-debug-overlay');
        if (existingOverlay) {
          existingOverlay.remove();
        }
      };

      // Setup keyboard shortcut (Alt+Shift+D) to toggle debug overlay
      const handleDebugKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'd') {
          let debugOverlay = document.getElementById('accessibility-debug-overlay');
          
          if (debugOverlay) {
            // If overlay exists, remove it
            debugOverlay.remove();
          } else {
            // Create new overlay
            debugOverlay = document.createElement('div');
            debugOverlay.id = 'accessibility-debug-overlay';
            debugOverlay.style.position = 'fixed';
            debugOverlay.style.bottom = '20px';
            debugOverlay.style.left = '20px';
            debugOverlay.style.backgroundColor = 'rgba(33, 33, 33, 0.8)';
            debugOverlay.style.color = '#fff';
            debugOverlay.style.padding = '12px 15px';
            debugOverlay.style.borderRadius = '6px';
            debugOverlay.style.fontSize = '11px';
            debugOverlay.style.fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
            debugOverlay.style.zIndex = '1000';
            debugOverlay.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            debugOverlay.style.border = '1px solid rgba(255,255,255,0.1)';
            debugOverlay.style.backdropFilter = 'blur(4px)';
            debugOverlay.style.maxWidth = '200px';
            
            // Add close button
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '2px';
            closeButton.style.right = '2px';
            closeButton.style.border = 'none';
            closeButton.style.background = 'none';
            closeButton.style.color = 'rgba(255,255,255,0.7)';
            closeButton.style.fontSize = '16px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '2px 5px';
            closeButton.style.borderRadius = '4px';
            closeButton.title = 'Close debug panel (Alt+Shift+D)';
            
            closeButton.addEventListener('mouseover', () => {
              closeButton.style.color = '#fff';
              closeButton.style.backgroundColor = 'rgba(255,255,255,0.1)';
            });
            
            closeButton.addEventListener('mouseout', () => {
              closeButton.style.color = 'rgba(255,255,255,0.7)';
              closeButton.style.backgroundColor = 'transparent';
            });
            
            closeButton.addEventListener('click', () => {
              debugOverlay?.remove();
            });
            
            const statusIcon = (active: boolean) => 
              active 
                ? `<span style="color:#4caf50;font-size:12px;margin-right:3px;">✓</span>` 
                : `<span style="color:#f44336;font-size:12px;margin-right:3px;">✕</span>`;
            
            debugOverlay.innerHTML = `
              <div style="padding-right: 16px; font-weight:500;margin-bottom:5px;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:5px;">Accessibility Debug</div>
              <div style="display:flex;align-items:center;margin:3px 0;">${statusIcon(settings.highContrast)}High Contrast</div>
              <div style="display:flex;align-items:center;margin:3px 0;">${statusIcon(settings.largeText)}Large Text</div>
              <div style="display:flex;align-items:center;margin:3px 0;"><span style="color:#2196f3;font-size:12px;margin-right:3px;">•</span>Font Size: ${settings.fontSizeMultiplier.toFixed(1)}x</div>
              <div style="display:flex;align-items:center;margin:3px 0;">${statusIcon(settings.reducedMotion)}Reduced Motion</div>
              <div style="display:flex;align-items:center;margin:3px 0;">${statusIcon(settings.keyboardFocusVisible)}Keyboard Focus</div>
              <div style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.6);text-align:center;">Press Alt+Shift+D to toggle this panel</div>
            `;
            
            debugOverlay.appendChild(closeButton);
            document.body.appendChild(debugOverlay);
            
            // Make the debug overlay draggable
            let isDragging = false;
            let offset = { x: 0, y: 0 };
            
            debugOverlay.style.cursor = 'move';
            
            debugOverlay.addEventListener('mousedown', (e) => {
              isDragging = true;
              offset.x = e.clientX - debugOverlay.getBoundingClientRect().left;
              offset.y = e.clientY - debugOverlay.getBoundingClientRect().top;
            });
            
            document.addEventListener('mousemove', (e) => {
              if (isDragging && debugOverlay) {
                debugOverlay.style.left = (e.clientX - offset.x) + 'px';
                debugOverlay.style.top = (e.clientY - offset.y) + 'px';
                // Remove bottom if top is set
                debugOverlay.style.bottom = 'auto';
              }
            });
            
            document.addEventListener('mouseup', () => {
              isDragging = false;
            });
          }
        }
      };
      
      window.addEventListener('keydown', handleDebugKeyDown);
      
      // Cleanup function
      return () => {
        window.removeEventListener('keydown', handleDebugKeyDown);
        cleanup();
      };
    }
  }, [settings]);
  
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
          sx={{
            color: 'inherit',
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: (theme) => theme.palette.primary.main,
              outlineOffset: '2px',
              borderRadius: '4px',
            },
          }}
        >
          <AccessibilityIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        id="accessibility-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionProps={{
          style: { transformOrigin: 'top right' },
          timeout: { enter: 300, exit: 200 }
        }}
        MenuListProps={{
          'aria-labelledby': 'accessibility-button',
          dense: false,
        }}
        PaperProps={{
          sx: {
            width: '300px',
            maxWidth: '100%',
            backgroundColor: '#ffffff !important',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'accessibilityMenuEnter 0.3s ease',
            '& .MuiTypography-root': {
              color: '#212121 !important',
            },
            '& .MuiTypography-caption': {
              color: '#757575 !important',
            },
            '& .MuiMenuItem-root': {
              opacity: 0,
              animation: 'accessibilityItemEnter 0.5s ease forwards',
              '&:nth-of-type(1)': {
                animationDelay: '0.1s',
              },
              '&:nth-of-type(2)': {
                animationDelay: '0.15s',
              },
              '&:nth-of-type(3)': {
                animationDelay: '0.2s',
              },
              '&:nth-of-type(4)': {
                animationDelay: '0.25s',
              },
            },
            '& .MuiDivider-root': {
              animation: 'accessibilityDividerEnter 0.6s ease forwards',
            },
            '& .MuiButton-root': {
              opacity: 0,
              animation: 'accessibilityItemEnter 0.5s ease forwards',
              animationDelay: '0.3s',
            }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#212121 !important' }}>
            Accessibility Settings
          </Typography>
          
          <Typography variant="caption" sx={{ color: '#757575 !important' }} paragraph>
            Customize your experience with these accessibility options. Settings are saved automatically.
          </Typography>
        </Box>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#212121 !important' }}>
            <FormatColorFillIcon fontSize="small" sx={{ mr: 1, color: '#1976d2 !important' }} /> Display
          </Typography>
          
          <MenuItem 
            onClick={() => handleSettingChange('largeText')}
            sx={{
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: '#1976d2',
                backgroundColor: '#f5f5f5',
              },
              color: '#212121 !important',
              backgroundColor: '#ffffff !important',
              '.MuiListItemIcon-root': {
                color: '#1976d2 !important',
              },
              '.MuiListItemText-primary': {
                color: '#212121 !important',
                fontWeight: 500,
              },
              '.MuiListItemText-secondary': {
                color: '#757575 !important',
              },
            }}
          >
            <ListItemIcon>
              {settings.largeText ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            </ListItemIcon>
            <ListItemText primary="Large Text" secondary="Increases text size" />
          </MenuItem>
          
          <MenuItem 
            onClick={() => handleSettingChange('highContrast')}
            sx={{
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: '#1976d2',
                backgroundColor: '#f5f5f5',
              },
              color: '#212121 !important',
              backgroundColor: '#ffffff !important',
              '.MuiListItemIcon-root': {
                color: '#1976d2 !important',
              },
              '.MuiListItemText-primary': {
                color: '#212121 !important',
                fontWeight: 500,
              },
              '.MuiListItemText-secondary': {
                color: '#757575 !important',
              },
            }}
          >
            <ListItemIcon>
              {settings.highContrast ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            </ListItemIcon>
            <ListItemText primary="High Contrast" secondary="Enhances color contrast" />
          </MenuItem>
          
          <Box sx={{ px: 1, mt: 1 }}>
            <Typography id="font-size-slider-label" gutterBottom variant="body2" sx={{ color: '#212121 !important' }}>
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
              sx={{
                color: '#1976d2 !important',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#1976d2 !important',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#1976d2 !important',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#bdbdbd !important',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#bdbdbd !important',
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: '#1976d2 !important',
                  color: '#fff !important',
                },
              }}
            />
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#212121 !important' }}>
            <SpeedIcon fontSize="small" sx={{ mr: 1, color: '#1976d2 !important' }} /> Motion & Interactions
          </Typography>
          
          <MenuItem 
            onClick={() => handleSettingChange('reducedMotion')}
            sx={{
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: '#1976d2',
                backgroundColor: '#f5f5f5',
              },
              color: '#212121 !important',
              backgroundColor: '#ffffff !important',
              '.MuiListItemIcon-root': {
                color: '#1976d2 !important',
              },
              '.MuiListItemText-primary': {
                color: '#212121 !important',
                fontWeight: 500,
              },
              '.MuiListItemText-secondary': {
                color: '#757575 !important',
              },
            }}
          >
            <ListItemIcon>
              {settings.reducedMotion ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            </ListItemIcon>
            <ListItemText primary="Reduced Motion" secondary="Minimizes animations" />
          </MenuItem>
          
          <MenuItem 
            onClick={() => handleSettingChange('keyboardFocusVisible')}
            sx={{
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: '#1976d2',
                backgroundColor: '#f5f5f5',
              },
              color: '#212121 !important',
              backgroundColor: '#ffffff !important',
              '.MuiListItemIcon-root': {
                color: '#1976d2 !important',
              },
              '.MuiListItemText-primary': {
                color: '#212121 !important',
                fontWeight: 500,
              },
              '.MuiListItemText-secondary': {
                color: '#757575 !important',
              },
            }}
          >
            <ListItemIcon>
              {settings.keyboardFocusVisible ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            </ListItemIcon>
            <ListItemText primary="Show keyboard focus indicators" secondary="Improves focus visibility" />
          </MenuItem>
        </Box>
        
        <Divider />
        
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={resetSettings}
            aria-label="Reset all accessibility settings to defaults"
            sx={{
              color: '#1976d2 !important',
              borderColor: '#1976d2 !important',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04) !important',
                borderColor: '#1976d2 !important',
              }
            }}
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleClose}
            sx={{
              backgroundColor: '#1976d2 !important',
              color: '#ffffff !important',
              '&:hover': {
                backgroundColor: '#1565c0 !important',
              }
            }}
          >
            Close
          </Button>
        </Box>
      </Menu>
      
      {/* Add animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes accessibilityMenuEnter {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes accessibilityItemEnter {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes accessibilityDividerEnter {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }
      `}} />
    </>
  );
};

export default AccessibilityMenu; 