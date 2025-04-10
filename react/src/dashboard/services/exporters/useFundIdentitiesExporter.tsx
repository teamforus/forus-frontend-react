import React, { useCallback } from 'react';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './hooks/useMakeExporterService';
import { useFundService } from '../FundService';
import usePushApiError from '../../hooks/usePushApiError';

export default function useFundIdentitiesExporter() {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const fundService = useFundService();
    const { makeSections, saveExportedData } = useMakeExporterService();

    const exportData = useCallback(
        (organization_id: number, fund_id: number, filters: object = {}) => {
            const onSuccess = (data: { data_format: string; fields: string }) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                setProgress(0);
                console.info('- data loaded from the api.');

                fundService
                    .exportIdentities(organization_id, fund_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res))
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            fundService.exportIdentityFields(organization_id, fund_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushApiError, saveExportedData, setProgress, fundService],
    );

    return { exportData };
}
