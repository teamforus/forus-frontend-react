// ProgressBar.tsx
// Horizontal progress bar with animated fill.
// Shows percentage as both width and text.
// Used to indicate chatbot progress or completion status.

import React from 'react';
import type { ProgressBarProps } from '../../../../props/types/PrecheckChatbotTypes';

export default function ProgressBar({ percentage }: ProgressBarProps) {
    return (
        // Outer container: static background and rounded edges
        <div className="progress-bar">
            {/* Inner bar: dynamic width and color based on percentage */}
            <div className="inner-bar" style={{ width: `${percentage}%` }}>
                {' '}
                {percentage}%
            </div>
        </div>
    );
}
