import { useCallback, useEffect, useRef } from 'react';
import { RequestConfigData } from '../props/ApiResponses';

export type LatestRequestHandlers<T> = {
    onStart?: () => void;
    onSuccess?: (result: T) => void;
    onError?: (error: unknown) => void;
    onFinally?: () => void;
};

export type LatestRequestRunner = <T>(
    request: (config?: RequestConfigData) => Promise<T>,
    handlers?: LatestRequestHandlers<T>,
) => void;

export default function useLatestRequest(): LatestRequestRunner {
    const requestIndexRef = useRef(0);
    const mountedRef = useRef(false);
    const xhrRef = useRef<XMLHttpRequest>(null);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            xhrRef.current?.abort();
        };
    }, []);

    return useCallback<LatestRequestRunner>(async (request, handlers = {}) => {
        const requestIndex = ++requestIndexRef.current;
        const isLatestRequest = () => mountedRef.current && requestIndex === requestIndexRef.current;
        const isLatestRequestIndex = () => requestIndex === requestIndexRef.current;

        const requestConfig: RequestConfigData = {
            onAbort: () => {
                if (requestIndex === requestIndexRef.current) {
                    xhrRef.current = null;
                }
            },
            onXhr: (xhr) => {
                if (requestIndex === requestIndexRef.current) {
                    xhrRef.current = xhr;
                }
            },
        };

        xhrRef.current?.abort();
        xhrRef.current = null;
        handlers.onStart?.();

        try {
            try {
                await Promise.resolve();
                const result = await request(requestConfig);

                if (isLatestRequest()) {
                    handlers.onSuccess?.(result);
                }

                return result;
            } catch (error) {
                if (isLatestRequest()) {
                    handlers.onError?.(error);
                }
            }
        } finally {
            if (isLatestRequestIndex()) {
                xhrRef.current = null;

                if (mountedRef.current) {
                    handlers.onFinally?.();
                }
            }
        }
    }, []);
}
