import File from '../../../../../props/models/File';
import { useFileService } from '../../../../../services/FileService';
import { useFundRequestValidatorService } from '../../../../../services/FundRequestValidatorService';
import React, { useCallback } from 'react';
import useOpenModal from '../../../../../hooks/useOpenModal';
import ModalImagePreview from '../../../../modals/ModalImagePreview';
import ModalPdfPreview from '../../../../modals/ModalPdfPreview';
import usePushDanger from '../../../../../hooks/usePushDanger';

export default function FundRequestRecordAttachmentsTab({
    attachments,
}: {
    attachments: Array<{
        file: File;
        date: string;
    }>;
}) {
    const fileService = useFileService();
    const fundRequestService = useFundRequestValidatorService();
    const hasFilePreview = useCallback((file) => fundRequestService.hasFilePreview(file), [fundRequestService]);
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();

    const downloadFile = useCallback(
        (e: React.MouseEvent<HTMLElement>, file: File) => {
            e?.preventDefault();
            e?.stopPropagation();

            fileService.download(file).then((res) => {
                res.response.arrayBuffer().then((fileData) => {
                    fileService.downloadFile(file.original_name, fileData);
                });
            }, console.error);
        },
        [fileService],
    );

    const previewFile = useCallback(
        (e: React.MouseEvent<HTMLElement>, file: File) => {
            e?.preventDefault();
            e?.stopPropagation();

            if (file.ext == 'pdf') {
                fileService.download(file).then(
                    (res) => {
                        res.response.blob().then(
                            (fileData) => openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={fileData} />),
                            (res) => pushDanger('Error!', res?.message?.toString()),
                        );
                    },
                    (res) => pushDanger('Error!', res.data?.message),
                );
            } else if (['png', 'jpeg', 'jpg'].includes(file.ext)) {
                openModal((modal) => <ModalImagePreview modal={modal} imageSrc={file.url} />);
            }
        },
        [fileService, openModal, pushDanger],
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
