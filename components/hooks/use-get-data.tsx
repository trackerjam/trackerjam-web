import {useCallback, useEffect, useState} from 'react';

interface UsePostReturnType<T> {
  isLoading: boolean;
  data: T | null | undefined;
  error: string | null;
  update: () => void;
}

export function useGetData<T>(url: string): UsePostReturnType<T> {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(() => {
    setIsLoading(true);
    setError(null);

    window
      .fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      })
      .then((res) => res.json())
      .then((json) => {
        console.log('json', json);
        if (json?.status === 'error' && json?.errorMsg) {
          throw new Error(json?.errorMsg);
        } else {
          setData(json);
        }
      })
      .catch((err) => setError(err?.message))
      .finally(() => setIsLoading(false));
  }, [url]);

  useEffect(() => {
    update();
  }, [update]);

  return {data, isLoading, error, update};
}
