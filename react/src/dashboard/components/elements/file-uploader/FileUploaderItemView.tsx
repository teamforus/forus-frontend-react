import React, { Fragment, useCallback, useMemo } from 'react';
import { useFileService } from '../../../services/FileService';
import { ResponseError } from '../../../props/ApiResponses';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalImagePreview from '../../modals/ModalImagePreview';
import ModalPdfPreview from '../../modals/ModalPdfPreview';
import { FileUploaderItem } from '../../../../webshop/components/elements/file-uploader/FileUploader';

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

            if (file.file_data.ext == 'pdf') {
                fileService
                    .downloadBlob(file.file_data)
                    .then((res) => {
                        openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={res.data} />);
                    })
                    .catch((err: ResponseError) => console.error(err));
            } else if (['png', 'jpeg', 'jpg'].includes(file.file_data.ext)) {
                openModal((modal) => <ModalImagePreview modal={modal} imageSrc={file.file_data.url} />);
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
                                title={item.file_data?.ext == 'pdf' ? 'Bekijk PDF-bestand' : 'Bekijk file'}
                                aria-label={item.file_data?.ext == 'pdf' ? 'Bekijk PDF-bestand' : 'Bekijk file'}
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
