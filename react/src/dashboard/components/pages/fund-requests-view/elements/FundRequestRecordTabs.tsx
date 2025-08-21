import React, { useMemo, useState } from 'react';
import FundRequestRecordHistoryTab from './record-tabs/FundRequestRecordHistoryTab';
import FundRequestRecordAttachmentsTab from './record-tabs/FundRequestRecordAttachmentsTab';
import FundRequestRecordClarificationsTab from './record-tabs/FundRequestRecordClarificationsTab';
import FundRequestRecord from '../../../../props/models/FundRequestRecord';
import useTranslate from '../../../../hooks/useTranslate';

export default function FundRequestRecordTabs({ fundRequestRecord }: { fundRequestRecord: FundRequestRecord }) {
    const contentMap = useMemo(
        () => [
            fundRequestRecord.files.length > 0 ? 'files' : null,
            fundRequestRecord.history.length > 0 ? 'history' : null,
            fundRequestRecord.clarifications.length > 0 ? 'clarifications' : null,
        ],
        [fundRequestRecord],
    );

    const translate = useTranslate();

    const hasMultiple = useMemo(() => contentMap.filter((value) => value).length > 1, [contentMap]);
    const [shownType, setShownType] = useState(contentMap.filter((value) => value)[0] || null);

    return (
        <div className="block" data-dusk={`fundRequestRecordTabs${fundRequestRecord.id}`}>
            {hasMultiple && (
                <div className="block block-label-tabs">
                    {fundRequestRecord.files.length > 0 && (
                        <div
                            className={`label-tab ${shownType == 'files' ? 'active' : ''}`}
                            data-dusk={`fundRequestRecordFilesTab`}
                            onClick={() => setShownType('files')}>
                            {translate('validation_request_details.labels.files', {
                                count: fundRequestRecord.files.length,
                            })}
                        </div>
                    )}

                    {fundRequestRecord.clarifications.length > 0 && (
                        <div
                            className={`label-tab ${shownType == 'clarifications' ? 'active' : ''}`}
                            onClick={() => setShownType('clarifications')}
                            data-dusk={`fundRequestRecordClarificationsTab`}>
                            {translate('validation_request_details.labels.clarification_requests', {
                                count: fundRequestRecord.clarifications.length,
                            })}
                        </div>
                    )}

                    {fundRequestRecord.history.length > 0 && (
                        <div
                            className={`label-tab ${shownType == 'history' ? 'active' : ''}`}
                            onClick={() => setShownType('history')}
                            data-dusk={`fundRequestRecordHistoryTab`}>
                            {translate('validation_request_details.labels.history', {
                                count: fundRequestRecord.history.length,
                            })}
                        </div>
                    )}
                </div>
            )}

            {shownType == 'clarifications' && fundRequestRecord.clarifications.length > 0 && (
                <FundRequestRecordClarificationsTab fundRequestRecord={fundRequestRecord} />
            )}

            {shownType == 'history' && fundRequestRecord.history.length > 0 && (
                <FundRequestRecordHistoryTab record={fundRequestRecord} />
            )}

            {shownType == 'files' && fundRequestRecord.files.length > 0 && (
                <FundRequestRecordAttachmentsTab
                    attachments={fundRequestRecord.files.map((file) => ({
                        file,
                        date: fundRequestRecord.created_at_locale,
                    }))}
                />
            )}
        </div>
    );
}
