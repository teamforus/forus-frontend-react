import React, { Dispatch, SetStateAction, useMemo } from 'react';
import FundRequestRecord from '../../../../../dashboard/props/models/FundRequestRecord';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import { uniq } from 'lodash';
import Label from '../../../elements/label/Label';
import FundRequestClarificationAnswered from './FundRequestClarificationAnswered';

export default function FundRequestRecordsBlockItem({
    record,
    fundRequest,
    shownRecords,
    setShownRecords,
}: {
    record: FundRequestRecord;
    fundRequest: FundRequest;
    shownRecords: Array<number>;
    setShownRecords: Dispatch<SetStateAction<Array<number>>>;
}) {
    const translate = useTranslate();

    const answered = useMemo(
        () => record.clarifications.filter((item) => ['answered', 'closed'].includes(item.state)),
        [record.clarifications],
    );

    const notAnsweredCount = useMemo(
        () => record.clarifications.filter((item) => item.state === 'pending').length,
        [record.clarifications],
    );

    return (
        <div
            className={classNames(
                'fund-request-record',
                shownRecords?.includes(record?.id) && 'fund-request-record-open',
            )}
            id={`fundRequestRecords${record.id}`}>
            <div className="fund-request-record-header">
                <div className="fund-request-record-details">
                    <div className="fund-request-record-title">{record.record_type.name}</div>
                    <div className="fund-request-record-value">{record.value}</div>
                </div>

                {answered.length > 0 && (
                    <div className="fund-request-record-actions">
                        {notAnsweredCount === 0 && (
                            <Label type="light" size="xl" nowrap={true}>
                                {translate('fund_request.record.answer')}
                                <em className="mdi mdi-check-bold icon-end" aria-hidden="true" />
                            </Label>
                        )}

                        <button
                            type="button"
                            className="fund-request-record-toggle"
                            data-dusk={`toggleClarifications${record.id}`}
                            onClick={() => {
                                setShownRecords((records) => {
                                    return records?.includes(record?.id)
                                        ? records.filter((id) => id !== record.id)
                                        : uniq([...records, record.id]);
                                });
                            }}>
                            {translate('fund_request.record.view')}
                            <em className="mdi mdi-chevron-down fund-request-record-toggle-icon" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            {shownRecords?.includes(record?.id) && (
                <div className="fund-request-conversations">
                    {answered.map((clarification) => (
                        <FundRequestClarificationAnswered
                            key={clarification.id}
                            fundRequest={fundRequest}
                            clarification={clarification}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
