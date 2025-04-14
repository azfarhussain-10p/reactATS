import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Snackbar, Badge } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import { getPendingFormsCount, processPendingForms } from '../utils/offlineFormHandler';

const OnlineStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  const [pendingFormsCount, setPendingFormsCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    processed: number;
    failed: number;
  } | null>(null);

  // Check for pending forms
  const checkPendingForms = async () => {
    if (isOnline) {
      const count = await getPendingFormsCount();
      setPendingFormsCount(count);
    }
  };

  // Process pending forms
  const syncPendingForms = async () => {
    if (isOnline && pendingFormsCount > 0) {
      setIsSyncing(true);
      try {
        const result = await processPendingForms();
        setSyncResult({
          processed: result.processed,
          failed: result.failed
        });
        
        // Refresh the count after sync
        await checkPendingForms();
      } catch (error) {
        console.error('Error syncing forms:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineAlert(true);
      checkPendingForms();
      
      // When we come back online, try to sync forms
      setTimeout(() => {
        syncPendingForms();
      }, 1000); // Short delay to let other components initialize
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const message = event.data;
      
      if (message && message.type === 'FORM_SYNC_COMPLETED') {
        setSyncResult({
          processed: message.processed,
          failed: message.failed
        });
        
        // Refresh the count after sync
        checkPendingForms();
        setIsSyncing(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    
    // Listen for form processing events
    const handleFormsProcessed = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setSyncResult({
        processed: detail.processed,
        failed: detail.failed
      });
      
      // Refresh the count after external sync
      checkPendingForms();
    };
    
    window.addEventListener('offline-forms-processed', handleFormsProcessed);

    // Initial check for pending forms
    checkPendingForms();

    // Set up periodic check for pending forms
    const intervalId = setInterval(checkPendingForms, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-forms-processed', handleFormsProcessed);
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  // Watch pendingFormsCount and trigger sync if it's > 0 and we're online
  useEffect(() => {
    if (isOnline && pendingFormsCount > 0 && !isSyncing) {
      syncPendingForms();
    }
  }, [isOnline, pendingFormsCount, isSyncing]);

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          mr: 2
        }}
      >
        {isOnline ? (
          <Badge 
            badgeContent={pendingFormsCount} 
            color="warning"
            invisible={pendingFormsCount === 0}
          >
            <WifiIcon 
              color="success" 
              fontSize="small" 
              sx={{ mr: 1 }} 
            />
          </Badge>
        ) : (
          <WifiOffIcon 
            color="error" 
            fontSize="small" 
            sx={{ mr: 1 }} 
          />
        )}
        
        <Typography 
          variant="caption" 
          color={isOnline ? "success.main" : "error.main"}
        >
          {isOnline ? "Online" : "Offline"}
        </Typography>
        
        {isOnline && isSyncing && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <SyncIcon color="warning" fontSize="small" sx={{ animation: 'spin 2s linear infinite', mr: 0.5 }} />
            <Typography variant="caption" color="warning.main">
              Syncing
            </Typography>
          </Box>
        )}
      </Box>

      {/* Offline Alert */}
      <Snackbar 
        open={showOfflineAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowOfflineAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="warning" 
          onClose={() => setShowOfflineAlert(false)}
        >
          You are offline. Some features may be limited.
        </Alert>
      </Snackbar>

      {/* Online Alert */}
      <Snackbar 
        open={showOnlineAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowOnlineAlert(false)}
        >
          You are back online. {pendingFormsCount > 0 ? `Syncing ${pendingFormsCount} pending forms...` : ''}
        </Alert>
      </Snackbar>

      {/* Sync Result Alert */}
      <Snackbar 
        open={syncResult !== null} 
        autoHideDuration={6000} 
        onClose={() => setSyncResult(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={syncResult && syncResult.failed > 0 ? "warning" : "success"} 
          onClose={() => setSyncResult(null)}
        >
          {syncResult ? (
            syncResult.processed > 0 ? (
              <>Successfully synchronized {syncResult.processed} form{syncResult.processed > 1 ? 's' : ''}.
              {syncResult.failed > 0 && ` ${syncResult.failed} form${syncResult.failed > 1 ? 's' : ''} failed.`}</>
            ) : (
              `Failed to synchronize ${syncResult.failed} form${syncResult.failed > 1 ? 's' : ''}.`
            )
          ) : ''}
        </Alert>
      </Snackbar>

      {/* CSS for spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default OnlineStatusIndicator; 