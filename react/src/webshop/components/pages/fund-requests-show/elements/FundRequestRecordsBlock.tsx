import React, { Dispatch, Fragment, SetStateAction } from 'react';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FundRequestRecordsBlockItem from './FundRequestRecordsBlockItem';
import FundRequestRecord from '../../../../../dashboard/props/models/FundRequestRecord';
import FundRequestClarification from '../../../../../dashboard/props/models/FundRequestClarification';

export default function FundRequestRecordsBlock({
    fundRequest,
    setFundRequest,
    shownRecords,
    setShownRecords,
    setClarificationsResponded,
    shownClarificationForms,
    setShownClarificationForms,
    openResponseModal,
}: {
    fundRequest: FundRequest;
    setFundRequest: Dispatch<FundRequest>;
    shownRecords: Array<number>;
    setShownRecords: Dispatch<SetStateAction<Array<number>>>;
    setClarificationsResponded: Dispatch<SetStateAction<Array<number>>>;
    shownClarificationForms: Array<number>;
    setShownClarificationForms: Dispatch<SetStateAction<Array<number>>>;
    openResponseModal: (record: FundRequestRecord, clarification?: FundRequestClarification) => void;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            <div className="profile-content-header">
                <h2 id="fund-request-records-title" className="profile-content-title profile-content-title-sm">
                    {translate('fund_request.records.title', { count: fundRequest?.records?.length })}
                </h2>
                <p id="fund-request-records-subtitle" className="profile-content-subtitle">
                    {translate('fund_request.records.subtitle')}
                </p>
            </div>

            <div
                className="fund-request-records"
                aria-labelledby="fund-request-records-title"
                aria-describedby="fund-request-records-subtitle">
                {fundRequest?.records.map((record) => (
                    <FundRequestRecordsBlockItem
                        key={record.id}
                        fundRequest={fundRequest}
                        setFundRequest={setFundRequest}
                        record={record}
                        shownRecords={shownRecords}
                        setShownRecords={setShownRecords}
                        setClarificationsResponded={setClarificationsResponded}
                        shownClarificationForms={shownClarificationForms}
                        setShownClarificationForms={setShownClarificationForms}
                        openResponseModal={openResponseModal}
                    />
                ))}
            </div>
        </Fragment>
    );
}
