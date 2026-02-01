import { useState, useEffect } from 'react';
import { initDatabase } from '@/lib/database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setIsReady(true))
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        setError(err);
      });
  }, []);

  return { isReady, error };
}
