import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography, Paper, Alert, Button } from '@mui/material';
import { Lock as LockIcon, WarningAmber as WarningIcon } from '@mui/icons-material';

interface SecureRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  loginRedirect?: string;
  accessDeniedComponent?: React.ReactElement;
}

/**
 * SecureRoute component to protect routes that require authentication
 * and specific permissions or roles.
 */
const SecureRoute: React.FC<SecureRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  loginRedirect = '/login',
  accessDeniedComponent,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, loading, checkPermission, hasRole } = useAuth();

  // Display loading state if auth is still being determined
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={loginRedirect} state={{ from: location.pathname }} replace />;
  }

  // Check permissions if specified
  const hasPermissions =
    requiredPermissions.length === 0 ||
    requiredPermissions.every((permission) => checkPermission(permission));

  // Check roles if specified
  const userHasRequiredRole = requiredRoles.length === 0 || hasRole(requiredRoles);

  // If user doesn't have required permissions or roles, show access denied
  if (!hasPermissions || !userHasRequiredRole) {
    if (accessDeniedComponent) {
      return accessDeniedComponent;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <LockIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>

          <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
            <Typography>
              {!hasPermissions
                ? "You don't have the required permissions to access this page."
                : "Your user role doesn't have access to this page."}
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            If you believe you should have access to this page, please contact your administrator.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => (window.location.href = '/')}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // If all checks pass, render the protected route
  return <>{children}</>;
};

export default SecureRoute;
