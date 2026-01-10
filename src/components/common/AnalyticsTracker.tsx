import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../../services/analytics.service';

/**
 * AnalyticsTracker Component
 * Initializes analytics on mount and tracks page views on location changes.
 * Must be placed inside BrowserRouter.
 */
export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  // Initialize analytics on mount (only once) - delayed for better LCP
  useEffect(() => {
    const initAnalytics = () => {
      analyticsService.init();
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initAnalytics, { timeout: 2000 });
    } else {
      setTimeout(initAnalytics, 2000);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Track page view on location change
  useEffect(() => {
    const fullPath = location.pathname + location.search;
    analyticsService.trackPageView(fullPath);
  }, [location]);

  // This component doesn't render anything
  return null;
};
