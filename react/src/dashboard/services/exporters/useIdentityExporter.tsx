import React, { useCallback } from 'react';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './hooks/useMakeExporterService';
import useSponsorIdentitiesService from '../SponsorIdentitesService';
import usePushApiError from '../../hooks/usePushApiError';

export default function useIdentityExporter() {
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const identityService = useSponsorIdentitiesService();
    const { makeSections, saveExportedData } = useMakeExporterService();

    const exportData = useCallback(
        (organization_id: number, filters: object = {}) => {
            const onSuccess = (data: { data_format: string; fields: string }) => {
                const { data_format, fields } = data;
                const queryFilters = { ...filters, data_format, fields };

                setProgress(0);
                console.info('- data loaded from the api.');

                identityService
                    .export(organization_id, queryFilters)
                    .then((res) => saveExportedData(data, organization_id, res))
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            identityService.exportFields(organization_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushApiError, saveExportedData, setProgress, identityService],
    );

    return { exportData };
}
