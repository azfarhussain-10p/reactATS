import { useNavigate } from 'react-router-dom';
import { announce } from '../components/ScreenReaderAnnouncer';

/**
 * Custom hook for navigating to the Analytics page
 * Ensures consistent navigation and state handling for the Analytics page
 */
export function useAnalyticsNavigation() {
  const navigate = useNavigate();

  const goToAnalytics = (section?: string) => {
    // Navigate to the analytics page
    navigate('/analytics');
    
    // Announce the navigation for screen readers
    announce(`Navigated to ${section ? `${section} in ` : ''}Analytics Dashboard`);
    
    // Return a promise to indicate success
    return Promise.resolve(true);
  };

  return { goToAnalytics };
}

export default useAnalyticsNavigation; 