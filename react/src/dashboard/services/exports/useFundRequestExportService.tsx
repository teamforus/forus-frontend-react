import React, { useCallback } from 'react';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './useMakeExporterService';
import usePushApiError from '../../hooks/usePushApiError';
import { useFundRequestValidatorService } from '../FundRequestValidatorService';

export default function useFundRequestExportService() {
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const fundRequestService = useFundRequestValidatorService();
    const { makeSections, saveExportedData } = useMakeExporterService();

    const exportData = useCallback(
        (organization_id: number, filters: object = {}) => {
            const onSuccess = (data: { data_format: string; fields: string }) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                setProgress(0);
                console.info('- data loaded from the api.');

                fundRequestService
                    .export(organization_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res, 'fund-requests'))
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            fundRequestService.exportFields(organization_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushApiError, saveExportedData, setProgress, fundRequestService],
    );

    return { exportData };
}
