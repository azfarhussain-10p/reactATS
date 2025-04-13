import React, { useState, useEffect, useCallback } from 'react';

/**
 * Interface for the Announcer props
 */
interface ScreenReaderAnnouncerProps {
  politeness?: 'polite' | 'assertive';
}

// Create a global variable to track mount status
let isAnnouncerMounted = false;

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
  
  // Clear announcements after they've been read
  useEffect(() => {
    if (announcement) {
      const timerId = setTimeout(() => {
        setAnnouncement('');
      }, 3000);
      
      return () => clearTimeout(timerId);
    }
  }, [announcement]);
  
  // Make the announcer available globally
  useEffect(() => {
    // Set mounted flag
    isAnnouncerMounted = true;
    
    // Add the announce function to the window object
    (window as any).announceToScreenReader = (message: string, customPoliteness?: 'polite' | 'assertive') => {
      setAnnouncement(message);
    };
    
    return () => {
      // Clean up when component unmounts
      isAnnouncerMounted = false;
      delete (window as any).announceToScreenReader;
    };
  }, []);
  
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
    </>
  );
};

// Function to make announcements from anywhere in the application
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  try {
    if (!message) return;
    
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

export default ScreenReaderAnnouncer; 