import React from 'react';

export default function FundRequestProgress({
    step,
    steps,
    criteriaSteps,
}: {
    criteriaSteps: Array<string>;
    step: number;
    steps: Array<string>;
}) {
    return (
        <div className={`sign_up-progress ${criteriaSteps.length >= 5 ? 'sign_up-progress-compact' : ''}`}>
            <div
                className={`sign_up-step sign_up-step-info ${
                    step < steps.indexOf(criteriaSteps[0]) ? 'sign_up-step-active' : 'sign_up-step-done'
                }`}
                aria-hidden="true">
                <div className="sign_up-step-border" />
                <div className="mdi mdi-information-outline" />
            </div>

            {criteriaSteps?.map((_, index) => (
                <div
                    key={index}
                    className={`sign_up-step ${
                        step == steps.indexOf(_) && steps.includes(_) ? 'sign_up-step-active' : ''
                    }
                    ${step > steps.indexOf(_) ? 'sign_up-step-done' : ''}`}
                    aria-hidden="true">
                    <div className="sign_up-step-border" />
                    <div className="sign-up-step-block">Stap {index + 1}</div>
                </div>
            ))}

            <div className="sign_up-progress-overview" aria-hidden="true">
                Stap {step} van {steps.length}
            </div>

            <span className="sr-only">Stap {step}</span>
            <span className="sr-only">
                Stap {step} van {steps.length}
            </span>
        </div>
    );
}
