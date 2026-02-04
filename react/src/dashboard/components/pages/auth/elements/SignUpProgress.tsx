import React from 'react';
import classNames from 'classnames';

export default function SignUpProgress({
    step,
    infoSteps,
    shownSteps,
}: {
    step: number;
    infoSteps: number;
    shownSteps?: Array<number>;
}) {
    return (
        <div className={classNames('sign_up-progress', shownSteps.length >= 5 && 'sign_up-progress-compact')}>
            <div
                className={classNames(
                    'sign_up-step',
                    'sign_up-step-info',
                    step <= infoSteps ? 'sign_up-step-active' : 'sign_up-step-done',
                )}>
                <div className="sign_up-step-border"></div>
                <div className="mdi mdi-information-outline"></div>
            </div>
            {shownSteps?.map((stepItem, index) => (
                <div
                    key={stepItem}
                    className={classNames(
                        'sign_up-step',
                        step == stepItem + infoSteps && 'sign_up-step-active',
                        (step > stepItem + infoSteps || step == shownSteps.length + infoSteps) && 'sign_up-step-done',
                    )}>
                    <div className="sign_up-step-border"></div>
                    <div className="sign-up-step-block">Stap {index + 1}</div>
                </div>
            ))}
            <div className="sign_up-progress-overview">
                Stap {step} van {shownSteps?.length + 2}
            </div>
        </div>
    );
}
