import React, { Fragment, useState } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundRequestGoBackButton from '../FundRequestGoBackButton';
import FundCriteriaCustomOverview from '../../../funds/elements/FundCriteriaCustomOverview';
import UIControlCheckbox from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';

export default function FundRequestStepConfirmCriteria({
    fund,
    step,
    onPrevStep,
    progress,
    bsnWarning,
    submitInProgress,
    onSubmitConfirmCriteria,
}: {
    fund: Fund;
    step: number;
    onPrevStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    submitInProgress: boolean;
    onSubmitConfirmCriteria: () => void;
}) {
    const translate = useTranslate();

    const [confirmCriteria, setConfirmCriteria] = useState<boolean>(null);
    const [confirmCriteriaWarning, setConfirmCriteriaWarning] = useState<boolean>(null);

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane">
                <div className="sign_up-pane-header">Bevestig uw inkomen</div>

                {!submitInProgress ? (
                    <div className="sign_up-pane-body">
                        {['IIT', 'bus_2020', 'meedoen'].includes(fund.key) && (
                            <FundCriteriaCustomOverview fundKey={fund.key} />
                        )}

                        {!['IIT', 'bus_2020', 'meedoen'].includes(fund.key) && (
                            <p className="sign_up-pane-text">
                                U staat op het punt om een meedoenregeling aan te vragen. U dient te verklaren dat u aan
                                de voorwaarden voldoet.
                            </p>
                        )}

                        <p className="sign_up-pane-text">
                            <UIControlCheckbox
                                checked={confirmCriteria || false}
                                onChangeValue={(checked) => setConfirmCriteria(checked)}
                                id="confirm_criteria"
                                label="Ik verklaar dat ik voldoe aan de bovenstaande voorwaarden."
                            />
                        </p>

                        {fund.key == 'IIT' && (
                            <p className="sign_up-pane-text">
                                <UIControlCheckbox
                                    checked={confirmCriteriaWarning || false}
                                    onChangeValue={(checked) => setConfirmCriteriaWarning(checked)}
                                    id="confirm_criteria_warning"
                                    label="Ik weet dat het verstrekken van onjuiste informatie strafbaar is, dat ik een onterecht of een teveel ontvangen vergoeding terug moet betalen en dat ik een boete kan krijgen."
                                />
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="sign_up-pane-body">
                        <br />
                        <div className="sign_up-pane-loading">
                            <div className="mdi mdi-loading mdi-spin" />
                        </div>
                        <div className="sign_up-pane-text text-center text-muted">
                            Een moment geduld, het verzoek wordt verwerkt.
                        </div>
                        <br />
                    </div>
                )}

                <SignUpFooter
                    startActions={<FundRequestGoBackButton prevStep={onPrevStep} fund={fund} step={step} />}
                    endActions={
                        <button
                            className="button button-text button-text-padless"
                            disabled={!confirmCriteria || (fund.key == 'IIT' && !confirmCriteriaWarning)}
                            onClick={onSubmitConfirmCriteria}
                            tabIndex={0}
                            type="button"
                            role="button">
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
