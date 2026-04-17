'use client';

import { useEffect } from 'react';

export function SessionHeartbeat() {
  useEffect(() => {
    const update = () => {
      document.cookie = `cb-last-active=${Date.now()}; path=/; max-age=${60 * 30}`;
    };
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}
