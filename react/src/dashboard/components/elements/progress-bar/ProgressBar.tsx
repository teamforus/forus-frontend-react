import React from 'react';

export default function ProgressBar({ progressBar, status }: { progressBar: number; status: string }) {
    return (
        <div className="csv-progress">
            <div className="csv-progress-state">{status}</div>

            <div className="csv-progress-bar">
                <div className="csv-progress-bar-stick" style={{ width: `${progressBar}%` }} />
            </div>

            <div className="csv-progress-value">{progressBar.toFixed(2) + '%'}</div>
        </div>
    );
}
