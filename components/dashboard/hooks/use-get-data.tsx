import {useCallback, useEffect, useState} from 'react';

type DataType = any;

type UsePostReturnType = {
  isLoading: boolean;
  data: DataType;
  error: string | null;
  update: () => void;
};

export function useGetData(url: string): UsePostReturnType {
  const [data, setData] = useState<DataType>();
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
