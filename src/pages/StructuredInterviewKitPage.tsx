import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import StructuredInterviewKit from '../components/StructuredInterviewKit';
import PageHeader from '../components/PageHeader'; // Assuming you have a PageHeader component

const StructuredInterviewKitPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Structured Interview Kit"
        subtitle="Create and manage standardized interview kits for consistent candidate evaluation"
        docsLink="/help/structured-interview-kits"
      />

      <Paper elevation={0} sx={{ p: 0, mt: 3 }}>
        <StructuredInterviewKit />
      </Paper>
    </Box>
  );
};

export default StructuredInterviewKitPage;
