import {useCallback, useState} from 'react';

type UseSendReturnType = {
  isLoading: boolean;
  error: string | null;
  send: (data: any, method?: string) => Promise<any>;
};

export function useSendData(url: string): UseSendReturnType {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (body: any, method = 'POST') => {
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
        if (jsonData.status === 'error' && jsonData.errorMsg) {
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
