'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('salonpulse_theme');
    const dark = stored !== 'light'; // default to dark
    setIsDark(dark);
    // Apply class to <html> so Tailwind dark: utilities work too
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('salonpulse_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light-mode');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light-mode');
      }
      return next;
    });
  };

  return { isDark, toggle, mounted };
}
