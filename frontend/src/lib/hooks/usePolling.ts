// frontend/src/lib/hooks/usePolling.ts
import { useState, useEffect } from 'react';

interface PollingOptions<T> {
    interval: number;
    enabled: boolean;
    initialData?: T;
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

            setLoading(true);
            try {
                const result = await fetchFn();
                setData(result);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
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
    }, [fetchFn, options.enabled, options.interval]);

    return { loading, data, error };
}

export default usePolling;