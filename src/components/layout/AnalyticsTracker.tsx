'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import axios from 'axios';

const AnalyticsTrackerContent: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const recordVisit = async () => {
      try {
        // Prevent bots/crawlers from spamming analytics APIs
        if (typeof window !== 'undefined' && navigator.userAgent) {
          const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
          if (isBot) return;
        }

        const query = searchParams.toString();
        const fullPath = query ? `${pathname}?${query}` : pathname;
        await axios.post('/api/analytics/visit', { path: fullPath });
      } catch (err) {
        console.error('Failed to log visit analytics:', err);
      }
    };

    recordVisit();
  }, [pathname, searchParams]);

  return null;
};

export const AnalyticsTracker: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerContent />
    </Suspense>
  );
};
