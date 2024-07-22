import React, { useCallback, useMemo } from 'react';
import { useFileService } from '../../../../dashboard/services/FileService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalImagePreview from '../../modals/ModalImagePreview';
import ModalPdfPreview from '../../modals/ModalPdfPreview';
import { FileUploaderItem } from './FileUploader';

export default function FileUploaderItemView({
    item,
    template,
    buttons,
    readOnly,
    removeFile,
}: {
    item: FileUploaderItem;
    template?: 'default' | 'compact' | 'inline';
    buttons?: boolean;
    readOnly?: boolean;
    removeFile?: (file: FileUploaderItem) => void;
}) {
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const fileService = useFileService();

    const name = useMemo(() => {
        return item.file?.name || item.file_data?.original_name || '';
    }, [item.file?.name, item.file_data?.original_name]);
    const extension = useMemo(() => name?.split('.')[name.split('.').length - 1], [name]);

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
        <div className={`file-item ${item.uploading ? 'file-item-uploading' : ''}`}>
            <div
                className={`file-item-container ${template == 'compact' ? 'file-item-container-compact' : ''} ${
                    template == 'inline' ? 'file-item-container-inline' : ''
                }`}>
                <div className="file-item-icon">
                    <img src={extension ? assetUrl(`/assets/img/file-icon-${extension}.svg`) : undefined} alt="" />
                </div>
                <div className="file-item-name">{name}</div>
                <div className="file-item-progress">
                    <div className="file-item-progress-container">
                        <progress max="100" value={item.progress} />
                    </div>
                </div>

                {item.has_preview && buttons && (
                    <div className="file-item-action">
                        <button
                            className="mdi mdi-eye-outline"
                            onClick={(e) => previewFile(e, item)}
                            title="Bestand bekijken"
                            role="button"
                            tabIndex={0}
                            type="button"
                            name="Bestand bekijken"
                        />
                    </div>
                )}

                {!item.uploading && buttons && (
                    <div className="file-item-action">
                        <button
                            type={'button'}
                            className="mdi mdi-tray-arrow-down"
                            onClick={(e) => downloadFile(e, item)}
                            title="Bestand downloaden"
                            role="button"
                            tabIndex={0}
                            name="Bestand downloaden"></button>
                    </div>
                )}

                {!readOnly && (
                    <div className="file-item-action">
                        <button
                            type="button"
                            className="mdi mdi-close"
                            onClick={() => removeFile(item)}
                            title="Bestand verwijderen"
                            role="button"
                            tabIndex={0}
                            name="Bestand verwijderen"></button>
                    </div>
                )}
            </div>
            <div className="file-item-error">
                {item?.error?.map((error, index) => (
                    <div key={index} className="text-danger">
                        {error}
                    </div>
                ))}
            </div>
        </div>
    );
}
