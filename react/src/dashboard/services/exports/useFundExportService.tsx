import React, { useCallback } from 'react';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './useMakeExporterService';
import usePushApiError from '../../hooks/usePushApiError';
import { useFundService } from '../FundService';

export default function useFundExportService() {
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const fundService = useFundService();
    const { makeSections, saveExportedData } = useMakeExporterService();

    const exportData = useCallback(
        (organization_id: number, detailed: boolean, year: number) => {
            const onSuccess = (data: { data_format: string; fields: string }) => {
                const { data_format, fields } = data;
                const queryFilters = { data_format, fields, year, detailed: detailed ? 1 : 0 };

                setProgress(0);
                console.info('- data loaded from the api.');

                fundService
                    .financialOverviewExport(organization_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res))
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            fundService.financialOverviewExportFields(organization_id, { detailed: detailed ? 1 : 0 }).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushApiError, saveExportedData, setProgress, fundService],
    );

    return { exportData };
}
