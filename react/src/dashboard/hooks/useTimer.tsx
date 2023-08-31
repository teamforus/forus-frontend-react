import { useCallback, useEffect, useMemo, useState } from 'react';

export default function useTimer() {
    const [time, setTime] = useState(0);
    const [timeout, setTimeout] = useState(null);

    const setTimer = useCallback((interval: number) => {
        setTime(interval);

        const callback = () => {
            setTime((time) => {
                if (time > 0) {
                    setTimeout(window.setTimeout(callback, 1000));
                }

                return time - 1;
            });
        };

        setTimeout(window.setTimeout(callback, 1000));
    }, []);

    useEffect(() => {
        return () => window.clearTimeout(timeout);
    }, [timeout]);

    return useMemo(() => ({ time, timeout, setTimer }), [time, timeout, setTimer]);
}
