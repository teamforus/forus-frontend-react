import React, { Dispatch, SetStateAction, useMemo } from 'react';
import FundRequestRecord from '../../../../../dashboard/props/models/FundRequestRecord';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import FundRequestRecordsBlockItemDetails from './FundRequestRecordsBlockItemDetails';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import { uniq } from 'lodash';
import useIsMobile from '../../../../hooks/useIsMobile';
import FundRequestClarification from '../../../../../dashboard/props/models/FundRequestClarification';

export default function FundRequestRecordsBlockItem({
    record,
    inline = false,
    fundRequest,
    setFundRequest,
    shownRecords,
    setShownRecords,
    setClarificationsResponded,
    shownClarificationForms,
    setShownClarificationForms,
    openResponseModal,
}: {
    record: FundRequestRecord;
    inline?: boolean;
    fundRequest: FundRequest;
    setFundRequest: React.Dispatch<React.SetStateAction<FundRequest>>;
    shownRecords: Array<number>;
    setShownRecords: Dispatch<SetStateAction<Array<number>>>;
    setClarificationsResponded: Dispatch<SetStateAction<Array<number>>>;
    shownClarificationForms: Array<number>;
    setShownClarificationForms: Dispatch<SetStateAction<Array<number>>>;
    openResponseModal?: (record: FundRequestRecord, clarification?: FundRequestClarification) => void;
}) {
    const isMobile = useIsMobile();
    const translate = useTranslate();

    const answeredCount = useMemo(
        () => record.clarifications.filter((item) => item.state === 'answered').length,
        [record.clarifications],
    );

    const notAnsweredCount = useMemo(
        () => record.clarifications.filter((item) => item.state !== 'answered').length,
        [record.clarifications],
    );

    return (
        <div
            className={classNames(
                'fund-request-record',
                inline && 'fund-request-record-inline',
                shownRecords?.includes(record?.id) && 'fund-request-record-open',
            )}>
            <div className="fund-request-record-header">
                <div className="fund-request-record-header-main">
                    <div className="fund-request-record-header-icon">
                        <em className="mdi mdi-card-account-details-outline" aria-hidden="true" />
                    </div>
                    <div className="fund-request-record-header-content">
                        <h3 className="fund-request-record-header-title">
                            <span>{record.record_type.name}</span>
                            <span className="fund-request-record-header-title-dot" aria-hidden="true">
                                •
                            </span>
                            <span>{record.value}</span>
                        </h3>
                        <div className="fund-request-record-header-subtitle">{record.created_at_locale}</div>
                    </div>
                </div>

                <div className="fund-request-record-header-actions">
                    {notAnsweredCount > 0 && (
                        <div className="label label-primary label-xl nowrap">
                            <div className="label-blink" aria-hidden="true" />
                            {notAnsweredCount} <div className="label-text">{translate('fund_request.record.new')}</div>
                        </div>
                    )}

                    {notAnsweredCount === 0 && answeredCount > 0 && (
                        <div className="label label-light label-xl nowrap">
                            {translate('fund_request.record.answer')}
                            <em className="mdi mdi-check-bold icon-end" aria-hidden="true" />
                        </div>
                    )}

                    {record.clarifications.length > 0 && !inline && (
                        <button
                            type="button"
                            className="fund-request-record-header-view"
                            data-dusk={`toggleClarifications${record.id}`}
                            onClick={() => {
                                if (isMobile) {
                                    return openResponseModal?.(record);
                                }

                                setShownRecords((records) => {
                                    return records?.includes(record?.id)
                                        ? records.filter((id) => id !== record.id)
                                        : uniq([...records, record.id]);
                                });
                            }}>
                            {translate('fund_request.record.view')}
                            <em
                                className="mdi mdi-chevron-down fund-request-record-header-view-arrow"
                                aria-hidden="true"
                            />
                        </button>
                    )}
                </div>
            </div>

            {shownRecords?.includes(record?.id) && (
                <div className="fund-request-record-section">
                    <div className="block block-fund-request-conversations">
                        {record.clarifications.map((clarification) => (
                            <FundRequestRecordsBlockItemDetails
                                key={clarification.id}
                                record={record}
                                fundRequest={fundRequest}
                                setFundRequest={setFundRequest}
                                clarification={clarification}
                                setClarificationsResponded={setClarificationsResponded}
                                shownClarificationForms={shownClarificationForms}
                                setShownClarificationForms={setShownClarificationForms}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
