import React, { Dispatch, SetStateAction, useMemo } from 'react';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FundRequestClarification from '../../../../../dashboard/props/models/FundRequestClarification';
import FundRequestRecord from '../../../../../dashboard/props/models/FundRequestRecord';
import Label from '../../../elements/label/Label';
import FundRequestClarificationPending from './FundRequestClarificationPending';
import FundRequestClarificationAnswered from './FundRequestClarificationAnswered';

export default function FundRequestClarificationsBlock({
    fundRequest,
    setFundRequest,
    clarificationsResponded,
    setClarificationsResponded,
}: {
    fundRequest: FundRequest;
    setFundRequest: Dispatch<FundRequest>;
    clarificationsResponded: Array<number>;
    setClarificationsResponded: Dispatch<SetStateAction<Array<number>>>;
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
        <div className="card">
            <div className="card-section">
                <div className="card-section-header">
                    <h2 className="card-section-title" id="clarificationsBlockTitle">
                        {translate('fund_request.clarifications.title', {
                            count: records?.length,
                        })}
                    </h2>

                    <p className="card-section-subtitle">{translate('fund_request.clarifications.subtitle')}</p>
                </div>

                <div className="fund-request-clarifications" role="region" aria-labelledby="clarificationsBlockTitle">
                    {records.map((item, index) => (
                        <div className="fund-request-clarification" key={item.record.id}>
                            <div className="fund-request-clarification-header" key={item.record.id}>
                                <div className="fund-request-clarification-number">{index + 1}</div>

                                <div className="fund-request-clarification-title">
                                    <span>{item.record?.record_type?.name}</span>
                                    <span className="fund-request-clarification-separator" aria-hidden="true">
                                        •
                                    </span>
                                    <span>{item.record?.value}</span>
                                </div>

                                <div className="fund-request-clarification-actions">
                                    {item?.clarificationsPending?.length > 0 ? (
                                        <Label type="warning" nowrap={true}>
                                            {translate('fund_request.clarifications.info_pending')}
                                        </Label>
                                    ) : (
                                        <Label type="light" nowrap={true}>
                                            {translate('fund_request.clarifications.info_responded_count', {
                                                count: item?.clarificationsResponded?.length,
                                            })}
                                            <em className="mdi mdi-check-bold icon-end" aria-hidden="true" />
                                        </Label>
                                    )}
                                </div>
                            </div>

                            {item?.clarificationsPending?.length > 0 && (
                                <div className="fund-request-conversations">
                                    {item.clarifications.map((clarification) =>
                                        clarification.state === 'pending' ? (
                                            <FundRequestClarificationPending
                                                key={clarification.id}
                                                record={item.record}
                                                clarification={clarification}
                                                fundRequest={fundRequest}
                                                setFundRequest={setFundRequest}
                                                setClarificationsResponded={setClarificationsResponded}
                                            />
                                        ) : (
                                            <FundRequestClarificationAnswered
                                                key={clarification.id}
                                                clarification={clarification}
                                                fundRequest={fundRequest}
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
