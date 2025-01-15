import React, { useMemo, useState } from 'react';
import FundRequestRecord from '../../../../../dashboard/props/models/FundRequestRecord';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import FundRequestRecordClarificationCard from './FundRequestRecordClarificationCard';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function FundRequestRecordCard({
    record,
    request,
    setFundRequest,
}: {
    record: FundRequestRecord;
    request: FundRequest;
    setFundRequest: React.Dispatch<React.SetStateAction<FundRequest>>;
}) {
    const [open, setOpen] = useState(false);

    const translate = useTranslate();

    const notAnsweredCount = useMemo(
        () => record.clarifications.filter((item) => item.state !== 'answered').length,
        [record.clarifications],
    );

    return (
        <div className={`card card-fund-request-conversation ${open ? 'open' : ''}`}>
            <div className="card-header">
                <div className="card-header-wrapper">
                    <div className="card-header-icon">
                        <em className="mdi mdi-card-account-details-outline" />
                    </div>
                    <div className="card-heading-wrapper">
                        <h3 className="card-heading card-heading-lg">
                            {record.record_type.name}
                            <span>•</span>
                            {record.value}
                        </h3>
                        <div className="card-header-date">{record.created_at_locale}</div>
                    </div>
                    {notAnsweredCount > 0 && (
                        <div className="label label-primary label-xl nowrap">
                            <div className="label-blink" aria-hidden="true" />
                            {notAnsweredCount} <div className="label-text">{translate('fund_request.record.new')}</div>
                        </div>
                    )}
                    {record.clarifications.length > 0 && (
                        <div className="card-header-view" onClick={() => setOpen(!open)}>
                            {translate('fund_request.record.view')}
                            <em className="mdi mdi-chevron-down card-header-view-arrow" />
                        </div>
                    )}
                </div>
            </div>

            {open && (
                <div className="card-section">
                    <div className="fund-request-section">
                        <div className="fund-request-conversations">
                            {record.clarifications.map((clarification) => (
                                <FundRequestRecordClarificationCard
                                    key={clarification.id}
                                    record={record}
                                    fundRequest={request}
                                    setFundRequest={setFundRequest}
                                    clarification={clarification}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
