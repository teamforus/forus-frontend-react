import { useCallback } from 'react';
import useSetProgress from '../../dashboard/hooks/useSetProgress';
import useLatestRequest, { LatestRequestRunner } from '../../dashboard/hooks/useLatestRequest';

export default function useLatestRequestWithProgress(): LatestRequestRunner {
    const setProgress = useSetProgress();
    const runLatestRequest = useLatestRequest();

    return useCallback<LatestRequestRunner>(
        (request, handlers = {}) => {
            runLatestRequest(request, {
                ...handlers,
                onStart: () => {
                    setProgress(0);
                    handlers.onStart?.();
                },
                onFinally: () => {
                    try {
                        handlers.onFinally?.();
                    } finally {
                        setProgress(100);
                    }
                },
            });
        },
        [runLatestRequest, setProgress],
    );
}
