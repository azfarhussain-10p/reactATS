import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Interface for the Announcer props
 */
interface ScreenReaderAnnouncerProps {
  politeness?: 'polite' | 'assertive';
}

// Create a global variable to track mount status
let isAnnouncerMounted = false;

// Keep track of recent announcements to prevent duplicates
const recentAnnouncements = new Map<string, number>();

// Flag to prevent accessibility announcements during logout
let isLoggingOut = false;

/**
 * Global announcer for screen reader announcements.
 * Creates an ARIA live region that can be updated from anywhere in the app.
 * 
 * @example
 * import { announce } from '../components/ScreenReaderAnnouncer';
 * 
 * // Later in your component:
 * announce('Data has been refreshed');
 */
export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({ 
  politeness = 'polite' 
}) => {
  const [announcement, setAnnouncement] = useState<string>('');
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<string[]>([]);
  const announcementQueue = useRef<{message: string, politeness: 'polite' | 'assertive'}[]>([]);
  
  // Process queued announcements
  const processQueue = useCallback(() => {
    if (announcementQueue.current.length > 0) {
      const nextAnnouncement = announcementQueue.current.shift();
      if (nextAnnouncement) {
        setAnnouncement(nextAnnouncement.message);
        
        // For visual notifications (can be removed in production)
        setVisibleAnnouncements(prev => {
          // Limit to last 5 announcements
          const updatedList = [...prev, nextAnnouncement.message].slice(-5);
          return updatedList;
        });
      }
    }
  }, []);
  
  // Clear announcements after they've been read
  useEffect(() => {
    if (announcement) {
      const timerId = setTimeout(() => {
        setAnnouncement('');
        // Process next queued announcement
        setTimeout(processQueue, 100);
      }, 3000);
      
      return () => clearTimeout(timerId);
    }
  }, [announcement, processQueue]);
  
  // Make the announcer available globally
  useEffect(() => {
    // Set mounted flag
    isAnnouncerMounted = true;
    
    // Reset logout flag on mount
    isLoggingOut = false;
    
    // Add the announce function to the window object
    (window as any).announceToScreenReader = (message: string, customPoliteness?: 'polite' | 'assertive') => {
      // Skip accessibility announcements during logout except for logout message
      if (isLoggingOut && !message.includes("logged out")) {
        console.log('Skipping announcement during logout:', message);
        return;
      }
      
      // Flag that logout is happening if this is a logout message
      if (message.includes("logged out")) {
        isLoggingOut = true;
        // Reset the logout flag after a few seconds
        setTimeout(() => {
          isLoggingOut = false;
        }, 5000);
      }
      
      // Queue the announcement
      announcementQueue.current.push({
        message,
        politeness: customPoliteness || 'polite'
      });
      
      // If no active announcement, process queue immediately
      if (!announcement) {
        processQueue();
      }
    };
    
    // Listen for auth-change events to manage announcements during logout
    const handleAuthChange = () => {
      // Set the logging out flag to prevent duplicate announcements
      isLoggingOut = true;
      // Clear any pending announcements except logout confirmation
      announcementQueue.current = announcementQueue.current.filter(
        item => item.message.includes("logged out")
      );
      
      // Reset the flag after a delay
      setTimeout(() => {
        isLoggingOut = false;
      }, 5000);
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      // Clean up when component unmounts
      isAnnouncerMounted = false;
      window.removeEventListener('auth-change', handleAuthChange);
      delete (window as any).announceToScreenReader;
    };
  }, [announcement, processQueue]);
  
  return (
    <>
      <div 
        aria-live={politeness} 
        className="sr-only-announcement"
        role={politeness === 'assertive' ? 'alert' : 'status'}
      >
        {announcement}
      </div>
      <div 
        aria-live="assertive" 
        className="sr-only-announcement"
        role="alert"
      >
        {politeness === 'assertive' ? announcement : ''}
      </div>
      <div 
        aria-live="polite" 
        className="sr-only-announcement"
        role="status"
      >
        {politeness === 'polite' ? announcement : ''}
      </div>
      
      {/* Debug panel - can be removed in production */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.7)', 
            color: 'white',
            padding: '8px',
            fontSize: '12px',
            borderRadius: '4px',
            maxWidth: '300px',
            zIndex: 9999,
            display: 'none' // Set to 'block' to see announcements during development
          }}
        >
          <div>Recent announcements:</div>
          <ul style={{ margin: '5px 0', padding: '0 0 0 20px' }}>
            {visibleAnnouncements.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

// Function to make announcements from anywhere in the application
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  try {
    if (!message) return;
    
    // Skip accessibility announcements during logout except for logout message
    if (isLoggingOut && !message.includes("logged out")) {
      console.log('Skipping announcement during logout:', message);
      return;
    }
    
    // If this is a logout message, set the flag
    if (message.includes("logged out")) {
      isLoggingOut = true;
      // Reset accessibility announcements map to prevent old messages
      recentAnnouncements.clear();
      
      // Reset the flag after a delay
      setTimeout(() => {
        isLoggingOut = false;
      }, 5000);
    }
    
    // Check if this exact message was announced recently (within 3 seconds)
    const now = Date.now();
    const lastTime = recentAnnouncements.get(message);
    if (lastTime && now - lastTime < 3000) {
      console.log('Prevented duplicate announcement:', message);
      return; // Skip duplicate announcement
    }
    
    // Record this announcement
    recentAnnouncements.set(message, now);
    
    // Clean up old entries after a while
    setTimeout(() => {
      recentAnnouncements.delete(message);
    }, 10000);
    
    if (typeof window !== 'undefined' && (window as any).announceToScreenReader) {
      try {
        (window as any).announceToScreenReader(message, politeness);
      } catch (error) {
        // Silently fail if there's an error
        console.log('Screen reader announcement failed:', message);
      }
    } else if (isAnnouncerMounted) {
      console.log('Screen reader announcement queued:', message);
      // Retry after a short delay
      setTimeout(() => {
        if ((window as any).announceToScreenReader) {
          try {
            (window as any).announceToScreenReader(message, politeness);
          } catch (err) {
            console.log('Screen reader announcement retry failed:', message);
          }
        }
      }, 100);
    } else {
      // Don't cause an error, just log a message
      console.log('ScreenReaderAnnouncer not mounted or available');
    }
  } catch (error) {
    // Catch any unexpected errors to prevent app crashes
    console.log('Screen reader announcement error:', error);
  }
}

/**
 * Temporarily disables all accessibility announcements except logout
 * Use this during page transitions or major UI changes
 */
export function disableAnnouncementsTemporarily(durationMs = 3000): void {
  isLoggingOut = true;
  setTimeout(() => {
    isLoggingOut = false;
  }, durationMs);
}

export default ScreenReaderAnnouncer; 