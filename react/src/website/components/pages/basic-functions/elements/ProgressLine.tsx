import React, { useState } from 'react';

export default function ProgressLine({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    const lineWidth = useState((1 / totalSteps) * 100);
    const linePosLeft = useState((currentStep - 1) * lineWidth[0]);

    return (
        <div className="block-separator">
            <div className="line" style={{ left: `${linePosLeft[0]}%`, width: `${lineWidth[0]}%` }} />
        </div>
    );
}
