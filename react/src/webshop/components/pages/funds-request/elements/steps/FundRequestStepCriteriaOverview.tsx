import React, { Fragment, useMemo } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundRequestGoBackButton from '../FundRequestGoBackButton';
import { LocalCriterion } from '../../FundRequest';
import { groupBy, uniqBy } from 'lodash';

export default function FundRequestStepCriteriaOverview({
    fund,
    step,
    onPrevStep,
    onNextStep,
    progress,
    bsnWarning,
    pendingCriteria,
}: {
    fund: Fund;
    step: number;
    onPrevStep: () => void;
    onNextStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    pendingCriteria: Array<LocalCriterion>;
}) {
    const translate = useTranslate();

    const criteriaPerType = useMemo(() => {
        return groupBy(pendingCriteria, 'record_type_key');
    }, [pendingCriteria]);

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
                    <ul className="sign_up-pane-list sign_up-pane-list-criteria">
                        {uniqBy(pendingCriteria, 'record_type_key').map((criterion) => (
                            <li key={criterion.id}>
                                <div className="item-icon item-icon-default" />
                                {criteriaPerType?.[criterion?.record_type_key].length > 1 ? (
                                    <span>{criterion?.record_type?.name}</span>
                                ) : (
                                    <span>{criterion.title || criterion.title_default}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="sign_up-pane-footer">
                    <div className="flex-row">
                        <FundRequestGoBackButton prevStep={onPrevStep} fund={fund} step={step} />

                        <div className="flex-col text-right">
                            <button
                                className="button button-text button-text-padless"
                                onClick={onNextStep}
                                role="button"
                                type="button">
                                {translate('fund_request.sign_up.pane.footer.next')}
                                <div className="mdi mdi-chevron-right icon-right" />
                            </button>
                        </div>
                    </div>
                </div>

                {bsnWarning}
            </div>
        </Fragment>
    );
}
