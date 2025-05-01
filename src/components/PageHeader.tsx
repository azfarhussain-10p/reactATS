import React from 'react';
import { Box, Typography, Button, Link, Breadcrumbs, Divider } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  breadcrumbs?: {
    label: string;
    path: string;
  }[];
  docsLink?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionButton,
  breadcrumbs,
  docsLink,
}) => {
  return (
    <Box>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={crumb.path}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              underline={index === breadcrumbs.length - 1 ? 'none' : 'hover'}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {docsLink && (
            <Button
              startIcon={<HelpIcon />}
              sx={{ mr: 2 }}
              component={RouterLink}
              to={docsLink}
              size="small"
            >
              Help
            </Button>
          )}

          {actionButton && (
            <Button
              variant="contained"
              color="primary"
              onClick={actionButton.onClick}
              startIcon={actionButton.icon}
            >
              {actionButton.label}
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ mt: 2, mb: 1 }} />
    </Box>
  );
};

export default PageHeader;
