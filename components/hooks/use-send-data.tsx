import {useCallback, useState} from 'react';
import type {ErrorResponse} from '../../types/api';

interface UseSendReturnType<T, R> {
  isLoading: boolean;
  error: string | null;
  send: (data: T, method?: string) => Promise<T | R | ErrorResponse>;
}

export function useSendData<T, R = unknown>(url: string): UseSendReturnType<T, R> {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (body: T, method = 'POST') => {
      setIsLoading(true);
      setError(null);

      let jsonData;
      try {
        const res = await window.fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: JSON.stringify(body),
        });
        jsonData = await res.json();
        if ('error' in jsonData) {
          throw new Error(jsonData.errorMsg);
        }
      } catch (err: any) {
        setError(err?.message);
      }

      setIsLoading(false);
      return jsonData;
    },
    [url]
  );

  return {send, isLoading, error};
}
