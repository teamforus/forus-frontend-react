import React, { Fragment, useCallback, useMemo } from 'react';
import { useFileService } from '../../../services/FileService';
import { ResponseError } from '../../../props/ApiResponses';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalImagePreview from '../../modals/ModalImagePreview';
import ModalPdfPreview from '../../modals/ModalPdfPreview';
import { FileUploaderItem } from '../../../../webshop/components/elements/file-uploader/FileUploader';
import {
    isImageExtension,
    isPdfExtension,
    isPreviewableExtension,
    normalizeFileExtension,
} from '../../../helpers/filePreview';

export default function FileUploaderItemView({
    item,
    hidePreviewButton,
    hideDownloadButton,
    readOnly,
    removeFile,
}: {
    item: FileUploaderItem;
    hidePreviewButton?: boolean;
    hideDownloadButton?: boolean;
    readOnly?: boolean;
    removeFile?: (file: FileUploaderItem) => void;
}) {
    const openModal = useOpenModal();
    const fileService = useFileService();

    const name = useMemo(() => {
        return item.file?.name || item.file_data?.original_name || '';
    }, [item.file?.name, item.file_data?.original_name]);

    const previewFile = useCallback(
        (e: React.MouseEvent, file: Partial<FileUploaderItem>) => {
            e.preventDefault();
            e.stopPropagation();

            const fileData = file.file_data;
            const fileExtension = normalizeFileExtension(fileData?.ext);

            if (!fileData || !isPreviewableExtension(fileExtension)) {
                return;
            }

            if (isPdfExtension(fileExtension)) {
                fileService
                    .downloadBlob(fileData)
                    .then((res) => {
                        openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={res.data} />);
                    })
                    .catch((err: ResponseError) => console.error(err));
            } else if (isImageExtension(fileExtension)) {
                openModal((modal) => <ModalImagePreview modal={modal} imageSrc={fileData.url} />);
            }
        },
        [fileService, openModal],
    );

    const downloadFile = useCallback(
        (e: React.MouseEvent, file: Partial<FileUploaderItem>) => {
            e.preventDefault();
            e.stopPropagation();

            fileService.download(file.file_data).then((res) => {
                fileService.downloadFile(file.file_data.original_name, res.data);
            }, console.error);
        },
        [fileService],
    );

    return (
        <Fragment>
            <div className="block block-attachments-list">
                <div className="attachment-item">
                    <div className="attachment-icon">
                        <div className="mdi mdi-file" />
                        <div className="attachment-size">{item.file_data?.size || ' - kB'}</div>
                    </div>
                    <div className="attachment-name">{name}</div>
                    <div className="attachment-date"></div>
                    <div className="attachment-actions">
                        {!item.uploading && !hideDownloadButton && (
                            <button
                                type="button"
                                className="attachment-action"
                                title="Download"
                                aria-label="Download"
                                onClick={(e) => downloadFile(e, item)}>
                                <div className="mdi mdi-download" aria-hidden="true" />
                            </button>
                        )}

                        {item.has_preview && !hidePreviewButton && (
                            <button
                                type="button"
                                className="attachment-action"
                                title={isPdfExtension(item.file_data?.ext) ? 'Bekijk PDF-bestand' : 'Bekijk file'}
                                aria-label={isPdfExtension(item.file_data?.ext) ? 'Bekijk PDF-bestand' : 'Bekijk file'}
                                onClick={(e) => previewFile(e, item)}>
                                <div className="mdi mdi-eye" aria-hidden="true" />
                            </button>
                        )}

                        {!readOnly && (
                            <div className="file-item-action">
                                <button
                                    type="button"
                                    className="attachment-action"
                                    onClick={() => removeFile(item)}
                                    title="Remove file">
                                    <div className="mdi mdi-close" aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="file-item-error">
                {item?.error?.map((error, index) => (
                    <div key={index} className="text-danger">
                        {error}
                    </div>
                ))}
            </div>
        </Fragment>
    );
}
