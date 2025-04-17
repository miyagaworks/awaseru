// frontend/src/lib/hooks/usePolling.ts
import { useState, useEffect } from 'react';

interface PollingOptions<T> {
  interval: number;
  enabled: boolean;
  initialData?: T;
  showLoading?: boolean;
}

interface PollingResult<T> {
    loading: boolean;
    data: T | null;
    error: Error | null;
}

function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions<T>
): PollingResult<T> {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    const poll = async () => {
      if (!options.enabled) return;

      // showLoadingオプションがfalseの場合はローディング状態を変更しない
      if (options.showLoading !== false) {
        setLoading(true);
      }

      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (options.showLoading !== false) {
          setLoading(false);
        }
      }
    };

    // 初回実行
    poll();

    // 定期実行のセットアップ
    if (options.enabled && options.interval > 0) {
      timerId = setInterval(poll, options.interval);
    }

    // クリーンアップ関数
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [fetchFn, options.enabled, options.interval, options.showLoading]);

  return { loading, data, error };
}

export default usePolling;