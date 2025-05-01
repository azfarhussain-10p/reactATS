import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import DocumentSharing from '../components/DocumentSharing';

const DocumentSharingPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Document Sharing & Collaboration
        </Typography>
        <Typography variant="body1" paragraph>
          This tool allows teams to share and collaborate on interview documents, assessments, and
          other files related to the recruitment process.
        </Typography>
      </Paper>

      <Box mt={3}>
        <DocumentSharing />
      </Box>
    </Container>
  );
};

export default DocumentSharingPage;
