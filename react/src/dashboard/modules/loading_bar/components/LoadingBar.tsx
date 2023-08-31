import React, { useContext, useEffect, useState } from 'react';
import { loadingBarContext } from '../context/LoadingBarContext';
import { classList } from '../../../helpers/utils';

export default function LoadingBar() {
    const { progress } = useContext(loadingBarContext);
    const [progressValue, setProgressValue] = useState(progress);

    useEffect(() => {
        setProgressValue(progress);
    }, [progress]);

    useEffect(() => {
        const interval = 100;
        const multiplier = 0.1;

        const intervalId = window.setInterval(() => {
            setProgressValue((progressValue) => {
                if (progressValue == 100) {
                    return progressValue;
                }

                let incrementBy: number;

                if (progressValue < 50) {
                    incrementBy = 10;
                } else if (progressValue < 75) {
                    incrementBy = 5;
                } else if (progressValue < 90) {
                    incrementBy = 2;
                } else if (progressValue < 95) {
                    incrementBy = 1;
                } else if (progressValue < 98) {
                    incrementBy = 0.25;
                } else {
                    incrementBy = 0.1;
                }

                return Math.min(progressValue + incrementBy * multiplier, 100);
            });
        }, interval);

        return () => window.clearInterval(intervalId);
    }, []);

    return (
        <div
            className={classList([
                'block block-page-loading-bar',
                progressValue == 0 ? 'start' : null,
                progressValue == 100 ? 'complete' : null,
            ])}
            style={{ width: progressValue + '%' }}
        />
    );
}
