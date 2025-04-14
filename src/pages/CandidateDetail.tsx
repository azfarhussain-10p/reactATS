import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CandidateDetail: React.FC = () => {
  return (
    <Box p={3}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Candidate Details
        </Typography>
        <Typography>
          This is a placeholder for the Candidate Detail page.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CandidateDetail; 