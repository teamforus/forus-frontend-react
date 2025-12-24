import React from 'react';
import classNames from 'classnames';

export default function BlockProgressSteps({
    step,
    steps,
    finalStep,
}: {
    step: number;
    steps: Array<number>;
    finalStep: number;
}) {
    return (
        <div className="block block-progress-steps">
            {steps.map((item, index) => (
                <div
                    key={index}
                    className={classNames('progress-step', {
                        'progress-step-active': step === item,
                        'progress-step-done': step > item,
                    })}>
                    <div className="progress-step-border" />
                    {step < finalStep && <div className="progress-step-separator" />}
                </div>
            ))}
        </div>
    );
}
