# Offline Capabilities in ATS Application

This document explains the offline support features in the ATS application and how to use them in your code.

## Overview

The ATS application includes comprehensive offline capabilities:

1. **Progressive Web App (PWA) Support**: Allows users to install the app and access it offline.
2. **Offline Form Submission**: Automatically queues form submissions when offline and syncs when back online.
3. **Asset Caching**: Static assets and API responses are cached for offline use.
4. **Graceful Degradation**: Shows appropriate UI when users are offline.
5. **Sync Status**: UI indicators for online/offline status and sync progress.

## User Experience

When users go offline:

1. They see an offline status indicator in the top navigation bar.
2. They can continue using previously accessed/cached pages.
3. When submitting forms, data is stored locally.
4. When they come back online, forms are automatically submitted in the background.
5. Users receive notifications about the status of their offline-submitted forms.

## For Developers

### Using the Offline-Aware Form Component

For simple form submission with automatic offline support:

```tsx
import OfflineAwareForm from '../components/OfflineAwareForm';

const CreateCandidatePage = () => {
  const handleSubmitSuccess = (data) => {
    // Handle success/offline-queued result
    if (data.offlineQueued) {
      console.log('Form queued for offline submission');
    } else {
      console.log('Candidate created:', data);
    }
  };

  return (
    <OfflineAwareForm 
      apiEndpoint="/api/candidates" 
      method="POST"
      onSubmit={handleSubmitSuccess}
      successMessage="Candidate created successfully!"
      offlineMessage="Candidate will be created when you're back online."
    >
      <TextField name="firstName" label="First Name" required />
      <TextField name="lastName" label="Last Name" required />
      <TextField name="email" label="Email" required type="email" />
      
      <Button type="submit" variant="contained" color="primary">
        Create Candidate
      </Button>
    </OfflineAwareForm>
  );
};
```

### Using the Offline-Aware Submit Hook

For more advanced cases where you need more control:

```tsx
import { useState } from 'react';
import useOfflineAwareSubmit from '../hooks/useOfflineAwareSubmit';

const JobApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    coverletter: ''
  });
  
  const { 
    submit, 
    isLoading, 
    isSuccess, 
    isError,
    isOfflineQueued 
  } = useOfflineAwareSubmit({
    onSuccess: (data) => {
      console.log('Application submitted successfully!');
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
    },
    onOfflineQueued: () => {
      console.log('Application saved for later submission');
    }
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit('/api/applications', 'POST', formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Apply'}
      </button>
      
      {isOfflineQueued && (
        <div className="offline-notice">
          You're offline. Your application will be submitted when you reconnect.
        </div>
      )}
    </form>
  );
};
```

### Direct API Integration

For direct API calls that need offline support:

```tsx
import { offlineAwareApiCall } from '../utils/offlineFormHandler';

// In a component or function
const submitData = async () => {
  try {
    const response = await offlineAwareApiCall(
      '/api/evaluations', 
      'POST', 
      evaluationData
    );
    
    if (response.offlineQueued) {
      // Handle offline case
      setMessage('Evaluation saved and will be submitted when you reconnect');
    } else {
      // Handle success case
      setMessage('Evaluation submitted successfully!');
    }
  } catch (error) {
    // Handle error case
    setMessage('Error submitting evaluation');
  }
};
```

## How It Works

1. **Service Worker**: Manages caching and offline capabilities.
2. **IndexedDB**: Stores form submissions when offline.
3. **Background Sync**: Processes stored form submissions when back online.
4. **Offline Detection**: Monitors network status and handles UI transitions.

## PWA Features

The application can be installed as a Progressive Web App (PWA):

1. **Manifest**: Define app details in `manifest.json`.
2. **Icons**: Provide app icons for various contexts.
3. **Offline Page**: Custom offline page when accessing uncached routes offline.

## Customization

### Environment Variables

- `VITE_OFFLINE_ENABLED`: Set to 'false' to disable offline support.
- `VITE_CACHE_ENABLED`: Set to 'false' to disable API response caching.

### API Service Configuration

The `ApiService` module integrates with offline support. You can control offline behavior with:

```tsx
// Disable offline support for a specific request
api.request({
  method: 'POST',
  url: '/api/some-endpoint',
  data: someData,
  enableOfflineSupport: false
});
```

## Troubleshooting

1. **Forms not syncing**: Check browser console for errors. Ensure service worker is registered.
2. **Offline indicator not showing**: Verify the component is added to your layout.
3. **Service worker not updating**: You may need to update `CACHE_VERSION` in service-worker.js. 