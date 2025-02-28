import React, { useCallback } from 'react';
import ModalPdfPreview from '../../components/modals/ModalPdfPreview';
import ModalImagePreview from '../../components/modals/ModalImagePreview';
import useOpenModal from '../../hooks/useOpenModal';
import File from '../../props/models/File';
import { useFileService } from '../FileService';
import usePushApiError from '../../hooks/usePushApiError';

export default function useFilePreview() {
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const fileService = useFileService();

    return useCallback(
        (file: File) => {
            if (file.ext == 'pdf') {
                fileService
                    .downloadBlob(file)
                    .then((res) => {
                        openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={res.data} />);
                    })
                    .catch(pushApiError);
            } else if (['png', 'jpeg', 'jpg'].includes(file.ext)) {
                openModal((modal) => <ModalImagePreview modal={modal} imageSrc={file.url} />);
            }
        },
        [fileService, openModal, pushApiError],
    );
}
