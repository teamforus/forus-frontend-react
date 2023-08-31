import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FundRequestRecordHistoryTab from './record-tabs/FundRequestRecordHistoryTab';
import FundRequestRecordAttachmentsTab from './record-tabs/FundRequestRecordAttachmentsTab';
import FundRequestRecordClarificationsTab from './record-tabs/FundRequestRecordClarificationsTab';
import FundRequestRecord from '../../../../props/models/FundRequestRecord';

export default function FundRequestRecordTabs({ fundRequestRecord }: { fundRequestRecord: FundRequestRecord }) {
    const contentMap = useMemo(
        () => [
            fundRequestRecord.files.length > 0 ? 'files' : null,
            fundRequestRecord.history.length > 0 ? 'history' : null,
            fundRequestRecord.clarifications.length > 0 ? 'clarifications' : null,
        ],
        [fundRequestRecord],
    );

    const { t } = useTranslation();
    const hasMultiple = useMemo(() => contentMap.filter((value) => value).length > 1, [contentMap]);
    const [shownType, setShownType] = useState(contentMap.filter((value) => value)[0] || null);

    return (
        <div className="block">
            {hasMultiple && (
                <div className="block block-label-tabs">
                    {fundRequestRecord.files.length > 0 && (
                        <div
                            className={`label-tab ${shownType == 'files' ? 'active' : ''}`}
                            onClick={() => setShownType('files')}>
                            {t('validation_request_details.labels.files', {
                                count: fundRequestRecord.files.length,
                            })}
                        </div>
                    )}

                    {fundRequestRecord.clarifications.length > 0 && (
                        <div
                            className={`label-tab ${shownType == 'clarifications' ? 'active' : ''}`}
                            onClick={() => setShownType('clarifications')}>
                            {t('validation_request_details.labels.clarification_requests', {
                                count: fundRequestRecord.clarifications.length,
                            })}
                        </div>
                    )}

                    {fundRequestRecord.history.length > 0 && (
                        <div
                            className={`label-tab ${shownType == 'history' ? 'active' : ''}`}
                            onClick={() => setShownType('history')}>
                            {t('validation_request_details.labels.history', {
                                count: fundRequestRecord.history.length,
                            })}
                        </div>
                    )}
                </div>
            )}

            {shownType == 'history' && fundRequestRecord.history.length > 0 && (
                <FundRequestRecordHistoryTab fundRequestRecord={fundRequestRecord} />
            )}

            {shownType == 'files' && fundRequestRecord.files.length > 0 && (
                <FundRequestRecordAttachmentsTab
                    attachments={fundRequestRecord.files.map((file) => ({
                        file,
                        date: fundRequestRecord.created_at_locale,
                    }))}
                />
            )}

            {shownType == 'clarifications' && fundRequestRecord.clarifications.length > 0 && (
                <FundRequestRecordClarificationsTab fundRequestRecord={fundRequestRecord} />
            )}
        </div>
    );
}
