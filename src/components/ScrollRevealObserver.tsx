'use client';
import { useEffect } from 'react';

export const ScrollRevealObserver: React.FC = () => {
  useEffect(() => {
    // If the browser doesn't support IntersectionObserver, we just show everything immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      const revealClasses = ['.reveal-on-scroll', '.reveal-left', '.reveal-right', '.reveal-fade'];
      document.querySelectorAll(revealClasses.join(', ')).forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px', // trigger 80px before coming fully into view
      threshold: 0.05, // trigger as soon as 5% is visible
    };

    const handleIntersection = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Stop observing once revealed
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const revealClasses = ['.reveal-on-scroll', '.reveal-left', '.reveal-right', '.reveal-fade'];

    // We run a small timeout to let dynamic React layouts finish rendering
    const timeout = setTimeout(() => {
      const elementsToObserve = document.querySelectorAll(revealClasses.join(', '));
      elementsToObserve.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return null;
};
