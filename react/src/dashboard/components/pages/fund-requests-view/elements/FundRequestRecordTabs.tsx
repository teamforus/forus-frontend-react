import React, { useMemo, useState } from 'react';
import FundRequestRecordHistoryTab from './record-tabs/FundRequestRecordHistoryTab';
import FundRequestRecordAttachmentsTab from './record-tabs/FundRequestRecordAttachmentsTab';
import FundRequestRecordClarificationsTab from './record-tabs/FundRequestRecordClarificationsTab';
import FundRequestRecord from '../../../../props/models/FundRequestRecord';
import useTranslate from '../../../../hooks/useTranslate';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';

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
                <BlockLabelTabs
                    size={null}
                    value={shownType}
                    setValue={(type) => setShownType(type)}
                    tabs={
                        [
                            fundRequestRecord.files.length > 0
                                ? {
                                      value: 'files',
                                      dusk: 'fundRequestRecordFilesTab',
                                      label: translate('validation_request_details.labels.files', {
                                          count: fundRequestRecord.files.length,
                                      }),
                                  }
                                : null,
                            fundRequestRecord.clarifications.length > 0
                                ? {
                                      value: 'clarifications',
                                      dusk: 'fundRequestRecordClarificationsTab',
                                      label: translate('validation_request_details.labels.clarification_requests', {
                                          count: fundRequestRecord.clarifications.length,
                                      }),
                                  }
                                : null,
                            fundRequestRecord.history.length > 0
                                ? {
                                      value: 'history',
                                      dusk: 'fundRequestRecordHistoryTab',
                                      label: translate('validation_request_details.labels.history', {
                                          count: fundRequestRecord.history.length,
                                      }),
                                  }
                                : null,
                        ].filter(Boolean) as Array<{ value: string; label: string; dusk?: string }>
                    }
                />
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
