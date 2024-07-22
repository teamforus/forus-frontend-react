import File from '../../../../../props/models/File';
import { useFileService } from '../../../../../services/FileService';
import { useFundRequestValidatorService } from '../../../../../services/FundRequestValidatorService';
import React, { useCallback } from 'react';
import useFilePreview from '../../../../../services/helpers/useFilePreview';

export default function FundRequestRecordAttachmentsTab({
    attachments,
}: {
    attachments: Array<{ file: File; date: string }>;
}) {
    const filePreview = useFilePreview();

    const fileService = useFileService();
    const fundRequestService = useFundRequestValidatorService();

    const hasFilePreview = useCallback((file) => fundRequestService.hasFilePreview(file), [fundRequestService]);

    const downloadFile = useCallback(
        (e: React.MouseEvent<HTMLElement>, file: File) => {
            e?.preventDefault();
            e?.stopPropagation();

            fileService
                .download(file)
                .then((res) => fileService.downloadFile(file.original_name, res.data, res.headers['content-type']))
                .catch(console.error);
        },
        [fileService],
    );

    const previewFile = useCallback(
        (e: React.MouseEvent<HTMLElement>, file: File) => {
            e?.preventDefault();
            e?.stopPropagation();

            filePreview(file);
        },
        [filePreview],
    );

    return (
        <div className="block block-attachments-list">
            <div className="block-attachments-inner">
                {attachments.map((attachment) => (
                    <a
                        key={attachment.file.uid}
                        className="attachment-item"
                        onClick={(e) => downloadFile(e, attachment.file)}>
                        <div className="attachment-icon">
                            <div className="mdi mdi-file" />
                            <div className="attachment-size">{attachment.file.size}</div>
                        </div>
                        <div className="attachment-name">{attachment.file.original_name}</div>
                        <div className="attachment-date">{attachment.date}</div>
                        {hasFilePreview(attachment.file) && (
                            <div
                                className="attachment-preview"
                                title="file.ext == 'pdf' ? 'Bekijk PDF-bestand' : 'Bekijk file'"
                                onClick={(e) => previewFile(e, attachment.file)}>
                                <div className="mdi mdi-eye" />
                            </div>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
}
