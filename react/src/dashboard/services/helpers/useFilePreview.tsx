import React, { useCallback } from 'react';
import ModalPdfPreview from '../../components/modals/ModalPdfPreview';
import ModalImagePreview from '../../components/modals/ModalImagePreview';
import useOpenModal from '../../hooks/useOpenModal';
import File from '../../props/models/File';
import { useFileService } from '../FileService';
import usePushApiError from '../../hooks/usePushApiError';
import {
    isImageExtension,
    isPdfExtension,
    isPreviewableExtension,
    normalizeFileExtension,
} from '../../helpers/filePreview';

export default function useFilePreview() {
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const fileService = useFileService();

    return useCallback(
        (file: File) => {
            const extension = normalizeFileExtension(file?.ext);

            if (!isPreviewableExtension(extension)) {
                return;
            }

            if (isPdfExtension(extension)) {
                fileService
                    .downloadBlob(file)
                    .then((res) => {
                        openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={res.data} />);
                    })
                    .catch(pushApiError);
            } else if (isImageExtension(extension)) {
                openModal((modal) => <ModalImagePreview modal={modal} imageSrc={file.url} />);
            }
        },
        [fileService, openModal, pushApiError],
    );
}
