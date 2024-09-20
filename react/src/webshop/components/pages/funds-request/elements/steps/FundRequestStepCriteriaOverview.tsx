import React, { Fragment } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundRequestGoBackButton from '../FundRequestGoBackButton';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';

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
    criteriaSteps: Array<{ title: string }>;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane">
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
                                <div className="list-steps-item-title">{step.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <SignUpFooter
                    startActions={<FundRequestGoBackButton prevStep={onPrevStep} fund={fund} step={step} />}
                    endActions={
                        <button
                            className="button button-text button-text-padless"
                            onClick={onNextStep}
                            role="button"
                            type="button">
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
