import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CandidatesList: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Candidates List
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is a placeholder for the Candidates List component.
          Navigate to the Documents section using the sidebar to view 
          the Document Sharing functionality.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CandidatesList; 