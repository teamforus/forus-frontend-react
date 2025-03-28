import React, { useCallback } from 'react';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './useMakeExporterService';
import usePushApiError from '../../hooks/usePushApiError';
import { useEmployeeService } from '../EmployeeService';

export default function useEmployeeExportService() {
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const employeeService = useEmployeeService();
    const { makeSections, saveExportedData } = useMakeExporterService();

    const exportData = useCallback(
        (organization_id: number, filters: object = {}) => {
            const onSuccess = (data: { data_format: string; fields: string }) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                setProgress(0);
                console.info('- data loaded from the api.');

                employeeService
                    .export(organization_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res, 'employees'))
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            employeeService.exportFields(organization_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushApiError, saveExportedData, setProgress, employeeService],
    );

    return { exportData };
}
