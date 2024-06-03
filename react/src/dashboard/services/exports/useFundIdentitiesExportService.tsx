import React, { useCallback } from 'react';
import usePushDanger from '../../hooks/usePushDanger';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './useMakeExporterService';
import { useFundService } from '../FundService';

export default function useFundIdentitiesExportService() {
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();

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
                    .export(organization_id, fund_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res))
                    .catch((res) => pushDanger('Mislukt!', res.data.message))
                    .finally(() => setProgress(100));
            };

            fundService.exportFields(organization_id, fund_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushDanger, saveExportedData, setProgress, fundService],
    );

    return { exportData };
}
