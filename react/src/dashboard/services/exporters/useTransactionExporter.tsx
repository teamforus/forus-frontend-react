import React, { useCallback } from 'react';
import useSetProgress from '../../hooks/useSetProgress';
import useEnvData from '../../hooks/useEnvData';
import useTransactionService from '../TransactionService';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './hooks/useMakeExporterService';
import usePushApiError from '../../hooks/usePushApiError';

export default function useTransactionExporter() {
    const envData = useEnvData();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const transactionService = useTransactionService();
    const { makeSections, saveExportedData } = useMakeExporterService();

    const exportData = useCallback(
        (organization_id: number, filters: object = {}) => {
            const onSuccess = (data: { data_format: string; fields: string }) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                setProgress(0);
                console.info('- data loaded from the api.');

                transactionService
                    .export(envData.client_type, organization_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res))
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            transactionService.exportFields(envData.client_type, organization_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [envData.client_type, makeSections, openModal, pushApiError, saveExportedData, setProgress, transactionService],
    );

    return { exportData };
}
