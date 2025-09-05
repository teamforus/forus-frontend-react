// ProgressBar.tsx
// Horizontal progress bar with animated fill.
// Shows percentage as both width and text.
// Used to indicate chatbot progress or completion status.

import React from 'react';
import type { ProgressBarProps } from '../../../../props/types/PrecheckChatbotTypes';

export default function ProgressBar({ percentage, className }: ProgressBarProps) {
    return (
        // Outer container: static background and rounded edges
        <div className={`w-full h-6 bg-stone-300 rounded-full overflow-hidden ${className}`}>
            {/* Inner bar: dynamic width and color based on percentage */}
            <div
                className="h-full bg-lime-800 transition-all duration-300 rounded-full text-white"
                style={{ width: `${percentage}%` }}>
                {' '}
                {percentage}%
            </div>
        </div>
    );
}
