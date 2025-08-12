import React, { Dispatch, SetStateAction, useState } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import FundRequestRecord from '../../../dashboard/props/models/FundRequestRecord';
import FundRequest from '../../../dashboard/props/models/FundRequest';
import FundRequestRecordsBlockItem from '../pages/fund-requests-show/elements/FundRequestRecordsBlockItem';
import FundRequestClarification from '../../../dashboard/props/models/FundRequestClarification';

export default function ModalFundRequestClarificationResponse({
    modal,
    record,
    fundRequest,
    clarification,
    setFundRequest,
    setClarificationsResponded,
}: {
    modal: ModalState;
    record: FundRequestRecord;
    fundRequest: FundRequest;
    clarification?: FundRequestClarification;
    setFundRequest: React.Dispatch<React.SetStateAction<FundRequest>>;
    setClarificationsResponded: Dispatch<SetStateAction<Array<number>>>;
}) {
    const translate = useTranslate();
    const [shownClarificationForms, setShownClarificationForms] = useState(clarification?.id ? [clarification.id] : []);

    return (
        <div className={classNames(`modal modal-animated`, !modal.loading && 'modal-loaded')} role="dialog">
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('reimbursement_confirmation.buttons.close')}
            />
            <div className="modal-window">
                <div
                    className="modal-close mdi mdi-close"
                    onClick={modal.close}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-label={translate('reimbursement_confirmation.buttons.close')}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('fund_request.modal.title')}</h2>
                </div>
                <div className="modal-body">
                    <div className="block block-fund-request">
                        <div className="fund-request-records">
                            <FundRequestRecordsBlockItem
                                key={record.id}
                                inline={true}
                                fundRequest={fundRequest}
                                setFundRequest={setFundRequest}
                                record={record}
                                shownRecords={[record.id]}
                                setShownRecords={() => null}
                                setClarificationsResponded={setClarificationsResponded}
                                shownClarificationForms={shownClarificationForms}
                                setShownClarificationForms={setShownClarificationForms}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
