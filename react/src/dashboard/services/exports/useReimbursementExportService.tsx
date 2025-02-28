import React, { useCallback } from 'react';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import { useReimbursementsService } from '../ReimbursementService';
import useMakeExporterService from './useMakeExporterService';
import usePushApiError from '../../hooks/usePushApiError';

export default function useReimbursementsExportService() {
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const reimbursementService = useReimbursementsService();
    const { makeSections, saveExportedData } = useMakeExporterService();

    const exportData = useCallback(
        (organization_id: number, filters: object = {}) => {
            const onSuccess = (data: { data_format: string; fields: string }) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                setProgress(0);
                console.info('- data loaded from the api.');

                reimbursementService
                    .export(organization_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res))
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            reimbursementService.exportFields(organization_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushApiError, saveExportedData, setProgress, reimbursementService],
    );

    return { exportData };
}
