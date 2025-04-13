import React, { useState, useEffect, useCallback } from 'react';

/**
 * Interface for the Announcer props
 */
interface ScreenReaderAnnouncerProps {
  politeness?: 'polite' | 'assertive';
}

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
    // Add the announce function to the window object
    (window as any).announceToScreenReader = (message: string, customPoliteness?: 'polite' | 'assertive') => {
      setAnnouncement(message);
    };
    
    return () => {
      // Clean up when component unmounts
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
    </>
  );
};

// Function to make announcements from anywhere in the application
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  if (typeof window !== 'undefined' && (window as any).announceToScreenReader) {
    (window as any).announceToScreenReader(message, politeness);
  } else {
    console.warn('ScreenReaderAnnouncer not mounted or available');
  }
}

export default ScreenReaderAnnouncer; 