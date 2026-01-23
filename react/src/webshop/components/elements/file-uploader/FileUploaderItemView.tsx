import React, { useCallback, useMemo } from 'react';
import { useFileService } from '../../../../dashboard/services/FileService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalImagePreview from '../../modals/ModalImagePreview';
import ModalPdfPreview from '../../modals/ModalPdfPreview';
import { FileUploaderItem } from './FileUploader';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import classNames from 'classnames';
import {
    isImageExtension,
    isPdfExtension,
    isPreviewableExtension,
    normalizeFileExtension,
} from '../../../../dashboard/helpers/filePreview';

export default function FileUploaderItemView({
    item,
    template,
    hidePreviewButton,
    hideDownloadButton,
    readOnly,
    removeFile,
}: {
    item: FileUploaderItem;
    template?: 'default' | 'compact' | 'inline' | 'group';
    hidePreviewButton?: boolean;
    hideDownloadButton?: boolean;
    readOnly?: boolean;
    removeFile?: (file: FileUploaderItem) => void;
}) {
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const translate = useTranslate();
    const fileService = useFileService();

    const name = useMemo(() => {
        return item.file?.name || item.file_data?.original_name || '';
    }, [item.file?.name, item.file_data?.original_name]);

    const extension = useMemo(() => {
        const lastDotIndex = name.lastIndexOf('.');
        return lastDotIndex === -1 ? '' : name.slice(lastDotIndex + 1).toLowerCase();
    }, [name]);

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

    const progressValue = useMemo(() => {
        const value = Number(item.progress);

        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(0, Math.min(100, Math.round(value)));
    }, [item.progress]);

    return (
        <div className={classNames('file-item', { 'file-item-uploading': item.uploading })}>
            <div
                className={classNames('file-item-container', {
                    'file-item-container-compact': template === 'compact',
                    'file-item-container-inline': template === 'inline',
                })}>
                <div className="file-item-icon">
                    <img src={extension ? assetUrl(`/assets/img/file-icon-${extension}.svg`) : undefined} alt="" />
                </div>
                <div className="file-item-name">{name}</div>
                <div className="file-item-progress">
                    <div className="file-item-progress-container">
                        <progress max="100" value={progressValue} />
                    </div>
                    {template === 'group' && <div className="file-item-progress-value">{progressValue}%</div>}
                </div>

                {item.has_preview && !hidePreviewButton && (
                    <div className="file-item-action">
                        <button
                            className="mdi mdi-eye-outline"
                            onClick={(e) => previewFile(e, item)}
                            title={translate('global.file_item.view_file')}
                            role="button"
                            tabIndex={0}
                            type="button"
                            name={translate('global.file_item.view_file')}
                        />
                    </div>
                )}

                {!item.uploading && !hideDownloadButton && (
                    <div className="file-item-action">
                        <button
                            type={'button'}
                            className="mdi mdi-tray-arrow-down"
                            onClick={(e) => downloadFile(e, item)}
                            title={translate('global.file_item.download_file')}
                            role="button"
                            tabIndex={0}
                            name={translate('global.file_item.download_file')}></button>
                    </div>
                )}

                {!readOnly && (
                    <div className="file-item-action">
                        <button
                            type="button"
                            className="mdi mdi-close"
                            onClick={() => removeFile(item)}
                            title={translate('global.file_item.remove_file')}
                            role="button"
                            tabIndex={0}
                            name={translate('global.file_item.remove_file')}></button>
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
