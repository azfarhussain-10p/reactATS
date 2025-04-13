import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const JobBoard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Job Board
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is a placeholder for the Job Board component.
          Navigate to the Documents section using the sidebar to view 
          the Document Sharing functionality.
        </Typography>
      </Paper>
    </Box>
  );
};

export default JobBoard; 