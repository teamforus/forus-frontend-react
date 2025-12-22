import React, { useCallback } from 'react';
import File from '../../props/models/File';
import { useFileService } from '../../services/FileService';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import useFilePreview from '../../services/helpers/useFilePreview';

export default function FileAttachmentsList({ attachments }: { attachments: Array<{ file: File; date?: string }> }) {
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
            {attachments.map((attachment) => (
                <div key={attachment.file.uid} className="attachment-item">
                    <div className="attachment-icon">
                        <div className="mdi mdi-file" />
                        <div className="attachment-size">{attachment.file.size}</div>
                    </div>
                    <div className="attachment-name">{attachment.file.original_name}</div>
                    <div className="attachment-date">{attachment.date || ''}</div>
                    <div className="attachment-actions">
                        <button
                            type="button"
                            className="attachment-action"
                            title="Download"
                            aria-label="Download"
                            onClick={(e) => downloadFile(e, attachment.file)}>
                            <div className="mdi mdi-download" aria-hidden="true" />
                        </button>
                        {hasFilePreview(attachment.file) && (
                            <button
                                type="button"
                                className="attachment-action"
                                title={attachment.file.ext == 'pdf' ? 'Bekijk PDF-bestand' : 'Bekijk file'}
                                aria-label={attachment.file.ext == 'pdf' ? 'Bekijk PDF-bestand' : 'Bekijk file'}
                                onClick={(e) => previewFile(e, attachment.file)}>
                                <div className="mdi mdi-eye" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
