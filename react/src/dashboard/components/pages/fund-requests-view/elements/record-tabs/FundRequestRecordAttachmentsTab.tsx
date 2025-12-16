import File from '../../../../../props/models/File';
import React from 'react';
import FileAttachmentsList from '../../../../elements/FileAttachmentsList';

export default function FundRequestRecordAttachmentsTab({
    attachments,
}: {
    attachments: Array<{ file: File; date?: string }>;
}) {
    return (
        <div data-dusk="attachmentsTabContent">
            <FileAttachmentsList attachments={attachments} />
        </div>
    );
}
