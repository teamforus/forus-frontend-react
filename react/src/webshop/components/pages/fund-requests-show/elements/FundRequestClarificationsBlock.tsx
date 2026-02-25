import React, { Fragment, useMemo } from 'react';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FundRequestClarification from '../../../../../dashboard/props/models/FundRequestClarification';
import FundRequestRecord from '../../../../../dashboard/props/models/FundRequestRecord';
import Label from '../../../elements/label/Label';

export default function FundRequestClarificationsBlock({
    fundRequest,
    clarificationsResponded,
    onRespond,
}: {
    fundRequest: FundRequest;
    clarificationsResponded: Array<number>;
    onRespond: (record: FundRequestRecord, clarification: FundRequestClarification) => void;
}) {
    const translate = useTranslate();

    const records = useMemo<
        Array<{
            record: FundRequestRecord;
            clarifications: Array<FundRequestClarification>;
            clarificationsPending: Array<FundRequestClarification>;
            clarificationsAnswered: Array<FundRequestClarification>;
            clarificationsResponded: Array<FundRequestClarification>;
        }>
    >(() => {
        return fundRequest?.records
            ?.map((current) => {
                const clarificationsList = current?.clarifications;

                const clarificationsPendingList = current?.clarifications.filter((clarification) => {
                    return clarification?.state === 'pending';
                });

                const clarificationsAnsweredList = current?.clarifications.filter((clarification) => {
                    return clarification?.state === 'answered';
                });

                const clarificationsRespondedList = current?.clarifications.filter((clarification) => {
                    return clarificationsResponded.includes(clarification.id);
                });

                return {
                    record: current,
                    clarifications: clarificationsList,
                    clarificationsPending: clarificationsPendingList,
                    clarificationsAnswered: clarificationsAnsweredList,
                    clarificationsResponded: clarificationsRespondedList,
                };
            }, [])
            .filter((item) => {
                if (item.clarificationsResponded.length > 0) {
                    return true;
                }

                return item.clarificationsPending.length > 0;
            });
    }, [clarificationsResponded, fundRequest?.records]);

    if (!records.length) {
        return null;
    }

    return (
        <Fragment>
            <div className="profile-content-header">
                <h2 className="profile-content-title profile-content-title-sm" id="clarificationsBlockTitle">
                    {translate('fund_request.clarifications.title', {
                        count: records?.length,
                    })}
                </h2>

                <p className="profile-content-subtitle">{translate('fund_request.clarifications.subtitle')}</p>
            </div>

            <div
                className="block block-fund-request-clarifications"
                role="region"
                aria-labelledby="clarificationsBlockTitle">
                {records.map((item) => (
                    <div
                        className="clarification-item"
                        id={
                            item?.clarificationsPending?.length > 0
                                ? `clarificationsRecords${item.record.id}`
                                : `clarificationsRecordsSuccess${item.record.id}`
                        }
                        key={item.record.id}>
                        {item?.clarificationsPending?.length > 0 ? (
                            <div className="clarification-item-icon clarification-item-icon-primary">
                                <em className="mdi mdi-email-outline" aria-hidden="true" />
                            </div>
                        ) : (
                            <div className="clarification-item-icon">
                                <em className="mdi mdi-check" aria-hidden="true" />
                            </div>
                        )}

                        <div className="clarification-item-content">
                            <div className="clarification-item-content-title">{item.record?.record_type?.name}</div>
                            <div className="clarification-item-content-subtitle">
                                {translate('fund_request.clarifications.info_requested')}
                            </div>
                        </div>

                        <div className="clarification-item-actions">
                            {item?.clarificationsPending?.length > 0 ? (
                                <button
                                    className="button button-primary button-sm"
                                    onClick={() => onRespond(item.record, item.clarificationsPending?.[0])}
                                    aria-describedby={
                                        item?.clarificationsPending?.length > 0
                                            ? `clarificationsRecords${item.record.id}`
                                            : undefined
                                    }>
                                    {translate('fund_request.clarifications.provide_info')}
                                </button>
                            ) : (
                                <Label type="light" size="xl" nowrap={true}>
                                    {translate('fund_request.clarifications.info_responded_count', {
                                        count: item?.clarificationsResponded?.length,
                                    })}
                                    <em className="mdi mdi-check-bold icon-end" aria-hidden="true" />
                                </Label>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Fragment>
    );
}
