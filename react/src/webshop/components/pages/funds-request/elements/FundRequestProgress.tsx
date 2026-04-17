import React from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function FundRequestProgress({
    step,
    steps,
    criteriaSteps,
}: {
    criteriaSteps: Array<string>;
    step: number;
    steps: Array<string>;
}) {
    const translate = useTranslate();

    return (
        <ul className={classNames('sign_up-progress', criteriaSteps.length >= 5 && 'sign_up-progress-compact')}>
            <li
                className={classNames(
                    'sign_up-step',
                    'sign_up-step-info',
                    step < steps.indexOf(criteriaSteps[0]) ? 'sign_up-step-active' : 'sign_up-step-done',
                )}
                aria-label={translate('fund_request.steps.info_label')}
                aria-current={step < steps.indexOf(criteriaSteps[0]) ? 'step' : undefined}>
                <div className="sign_up-step-border" />
                <div className="mdi mdi-information-outline" />
            </li>

            {criteriaSteps?.map((_, index) => (
                <li
                    key={index}
                    className={classNames(
                        'sign_up-step',
                        step == steps.indexOf(_) && steps.includes(_) && 'sign_up-step-active',
                        step > steps.indexOf(_) && 'sign_up-step-done',
                    )}
                    aria-current={step == steps.indexOf(_) && steps.includes(_) ? 'step' : undefined}>
                    <div className="sign_up-step-border" />
                    <div className="sign-up-step-block">
                        {translate('fund_request.steps.step', { step: index + 1 })}
                    </div>
                </li>
            ))}

            <li className="sign_up-progress-overview" aria-hidden="true">
                {translate('fund_request.steps.step_out_of', { step, total: steps.length })}
            </li>
        </ul>
    );
}
