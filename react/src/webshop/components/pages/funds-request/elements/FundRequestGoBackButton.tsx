import React, { Fragment } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Fund from '../../../../props/models/Fund';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function FundRequestGoBackButton({
    fund,
    step,
    prevStep,
    tabIndex = 1,
}: {
    fund?: Fund;
    step: number;
    prevStep: () => void;
    tabIndex?: number;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            {step <= 0 ? (
                <StateNavLink
                    className="button button-text button-text-padless"
                    name="fund-activate"
                    params={{ id: fund?.id }}
                    role="link"
                    tabIndex={tabIndex}>
                    <em className="mdi mdi-chevron-left icon-left" />
                    {translate('fund_request.buttons.back')}
                </StateNavLink>
            ) : (
                <div
                    className="button button-text button-text-padless"
                    onClick={prevStep}
                    role="button"
                    tabIndex={tabIndex}>
                    <div className="mdi mdi-chevron-left icon-left" />
                    {translate('fund_request.buttons.back')}
                </div>
            )}
        </Fragment>
    );
}
