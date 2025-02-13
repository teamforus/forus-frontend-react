import React, { Fragment } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundRequestGoBackButton from '../FundRequestGoBackButton';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';
import Markdown from '../../../../elements/markdown/Markdown';

export default function FundRequestStepCriteriaOverview({
    fund,
    step,
    criteriaSteps,
    onPrevStep,
    onNextStep,
    progress,
    bsnWarning,
}: {
    fund: Fund;
    step: number;
    onPrevStep: () => void;
    onNextStep: () => void;
    criteriaSteps: Array<{ title: string; description_html?: string }>;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane" data-dusk="criteriaStepsOverview">
                <h2 className="sign_up-pane-header" role="heading">
                    {translate('fund_request.sign_up.pane.header_title')}
                </h2>
                <div className="sign_up-pane-body">
                    <p className="sign_up-pane-text">
                        {translate('fund_request.sign_up.pane.text', {
                            fund_name: fund.name,
                        })}
                    </p>
                    <div className="sign_up-pane-list sign_up-pane-list-steps">
                        {criteriaSteps.map((step, index) => (
                            <div className="list-steps-item" key={index}>
                                <div className="list-steps-item-icon">{index + 1}</div>
                                <div className="list-steps-item-content">
                                    <div className="list-steps-item-title">{step.title}</div>
                                    {step.description_html && (
                                        <Markdown
                                            className={'list-steps-item-description'}
                                            content={step.description_html}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <SignUpFooter
                    startActions={
                        <FundRequestGoBackButton prevStep={onPrevStep} fund={fund} step={step} tabIndex={0} />
                    }
                    endActions={
                        <button
                            className="button button-text button-text-padless"
                            onClick={onNextStep}
                            role="button"
                            type="button"
                            data-dusk="nextStepButton"
                            tabIndex={0}>
                            {translate('fund_request.sign_up.pane.footer.next')}
                            <em className="mdi mdi-chevron-right icon-right" />
                        </button>
                    }
                />

                {bsnWarning}
            </div>
        </Fragment>
    );
}
