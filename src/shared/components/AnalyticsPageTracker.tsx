import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logAnalyticsEvent } from '@/shared/lib/firebase';

export function AnalyticsPageTracker() {
  const location = useLocation();

  useEffect(() => {
    logAnalyticsEvent('page_view', { page_path: location.pathname });
  }, [location.pathname]);

  return null;
}
