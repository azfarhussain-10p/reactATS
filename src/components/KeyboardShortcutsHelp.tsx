import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Keyboard as KeyboardIcon, Close as CloseIcon } from '@mui/icons-material';

/**
 * Interface for keyboard shortcut
 */
interface KeyboardShortcut {
  key: string;
  description: string;
  category: 'navigation' | 'actions' | 'accessibility' | 'data' | 'general';
}

/**
 * Component to display keyboard shortcuts for power users.
 * Can be toggled with Alt+K.
 */
const KeyboardShortcutsHelp: React.FC = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Keyboard shortcuts list
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    { key: '/', description: 'Focus search box', category: 'navigation' },
    { key: 'g then d', description: 'Go to dashboard', category: 'navigation' },
    { key: 'g then c', description: 'Go to candidates', category: 'navigation' },
    { key: 'g then j', description: 'Go to job board', category: 'navigation' },
    { key: 'g then a', description: 'Go to analytics', category: 'navigation' },

    // Action shortcuts
    { key: 'n', description: 'New item (context-dependent)', category: 'actions' },
    { key: 'e', description: 'Edit current item', category: 'actions' },
    { key: 's', description: 'Save changes', category: 'actions' },
    { key: 'Esc', description: 'Close dialog/cancel', category: 'actions' },
    { key: 'Delete', description: 'Delete selected item (with confirmation)', category: 'actions' },
    { key: 'Ctrl+Enter', description: 'Submit form', category: 'actions' },

    // Accessibility shortcuts
    { key: 'Alt+A', description: 'Open accessibility menu', category: 'accessibility' },
    { key: 'Alt+C', description: 'Toggle high contrast mode', category: 'accessibility' },
    {
      key: 'Alt+K',
      description: 'Show keyboard shortcuts (this dialog)',
      category: 'accessibility',
    },
    { key: 'Tab', description: 'Navigate between elements', category: 'accessibility' },
    { key: 'Shift+Tab', description: 'Navigate backward', category: 'accessibility' },
    { key: 'Space/Enter', description: 'Activate focused element', category: 'accessibility' },

    // Data and content shortcuts
    { key: 'r', description: 'Refresh data', category: 'data' },
    { key: 'f', description: 'Toggle filters', category: 'data' },
    { key: '+', description: 'Zoom in (charts/visuals)', category: 'data' },
    { key: '-', description: 'Zoom out (charts/visuals)', category: 'data' },
    { key: '0', description: 'Reset zoom level', category: 'data' },

    // General shortcuts
    { key: '?', description: 'Show this help dialog', category: 'general' },
    { key: 'Ctrl+/', description: 'Show command palette', category: 'general' },
    { key: 'Alt+←', description: 'Navigate back', category: 'general' },
    { key: 'Alt+→', description: 'Navigate forward', category: 'general' },
  ];

  // Handle keyboard shortcut to show this dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+K opens keyboard shortcuts help
      if ((e.key === 'k' && e.altKey) || e.key === '?') {
        setOpen((prev) => !prev);
      }

      // Escape closes the dialog
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts.reduce<Record<string, KeyboardShortcut[]>>(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {}
  );

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const CategoryTitle: React.FC<{ title: string }> = ({ title }) => (
    <Typography variant="h6" sx={{ textTransform: 'capitalize', mt: 2, mb: 1 }}>
      {title}
    </Typography>
  );

  const KeyboardKey: React.FC<{ keyText: string }> = ({ keyText }) => (
    <Box
      component="kbd"
      sx={{
        display: 'inline-block',
        padding: '0.2em 0.4em',
        fontSize: '0.85em',
        fontFamily: 'monospace',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '3px',
        boxShadow: '0 2px 0 rgba(0, 0, 0, 0.1)',
        mx: 0.5,
        minWidth: '1.5em',
        textAlign: 'center',
      }}
    >
      {keyText}
    </Box>
  );

  return (
    <>
      <Tooltip title="Keyboard shortcuts (Alt+K)">
        <IconButton onClick={handleToggle} aria-label="Keyboard shortcuts">
          <KeyboardIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="md"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <DialogTitle id="keyboard-shortcuts-title" sx={{ pr: 6 }}>
          Keyboard Shortcuts
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            The following keyboard shortcuts are available throughout the application to improve
            efficiency and accessibility. Press <KeyboardKey keyText="Esc" /> to close this dialog.
          </Typography>

          <Grid container spacing={3}>
            {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
              <Grid item xs={12} md={6} key={category}>
                <CategoryTitle title={category} />
                <Divider sx={{ mb: 1 }} />

                {categoryShortcuts.map((shortcut, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.75,
                      borderBottom: '1px solid',
                      borderBottomColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Box>
                      {shortcut.key.split(' then ').map((key, i, arr) => (
                        <React.Fragment key={i}>
                          <KeyboardKey keyText={key} />
                          {i < arr.length - 1 && ' then '}
                        </React.Fragment>
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', pl: 2 }}>
                      {shortcut.description}
                    </Typography>
                  </Box>
                ))}
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KeyboardShortcutsHelp;
