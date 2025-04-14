import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const JobOpenings: React.FC = () => {
  return (
    <Box p={3}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Job Openings
        </Typography>
        <Typography>
          This is a placeholder for the Job Openings page.
        </Typography>
      </Paper>
    </Box>
  );
};

export default JobOpenings; 