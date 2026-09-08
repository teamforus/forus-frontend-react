import React, { Dispatch, SetStateAction, useMemo, useState } from 'react';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FundRequestRecordsBlockItem from './FundRequestRecordsBlockItem';
import classNames from 'classnames';

export default function FundRequestRecordsBlock({
    fundRequest,
    shownRecords,
    setShownRecords,
}: {
    fundRequest: FundRequest;
    shownRecords: Array<number>;
    setShownRecords: Dispatch<SetStateAction<Array<number>>>;
}) {
    const translate = useTranslate();
    const [showRecords, setShowRecords] = useState(true);

    const visibleRecordTypeKeys = useMemo(() => {
        return (
            fundRequest?.fund?.criteria
                ?.filter(
                    (criterion) =>
                        !['children_same_address_nth', 'partner_same_address_nth'].includes(criterion.record_type_key),
                )
                .map((criterion) => criterion.record_type_key) || []
        );
    }, [fundRequest?.fund?.criteria]);

    return (
        <div className={classNames('card', 'card-collapsable', showRecords && 'open')}>
            <div
                className="card-header"
                onClick={() => setShowRecords(!showRecords)}
                role="button"
                tabIndex={0}
                aria-expanded={showRecords}
                aria-controls="fundRequestRecordsSection"
                aria-labelledby="fundRequestRecordsHeader"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowRecords(!showRecords);
                    }
                }}>
                <div className="card-header-wrapper">
                    <em className="mdi mdi-menu-down card-header-arrow" aria-hidden="true" />{' '}
                    <h2 className="card-heading card-heading-lg" id="fundRequestRecordsHeader">
                        {translate('fund_request.records.title', { count: fundRequest?.records?.length })}
                    </h2>
                </div>
            </div>

            {showRecords && (
                <div
                    className="card-section"
                    id="fundRequestRecordsSection"
                    role="region"
                    aria-labelledby="fundRequestRecordsHeader">
                    <div
                        className="fund-request-records"
                        aria-labelledby="fund-request-records-title"
                        aria-describedby="fund-request-records-subtitle">
                        {fundRequest?.records
                            .filter((record) => visibleRecordTypeKeys.includes(record.record_type_key))
                            .map((record) => (
                                <FundRequestRecordsBlockItem
                                    key={record.id}
                                    fundRequest={fundRequest}
                                    record={record}
                                    shownRecords={shownRecords}
                                    setShownRecords={setShownRecords}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
