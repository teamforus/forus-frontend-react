import React, { useCallback } from 'react';
import usePushDanger from '../../hooks/usePushDanger';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './useMakeExporterService';
import useSponsorIdentitiesService from '../SponsorIdentitesService';

export default function useIdentityExportService() {
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();

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
                    .catch((res) => pushDanger('Mislukt!', res.data.message))
                    .finally(() => setProgress(100));
            };

            identityService.exportFields(organization_id).then((res) => {
                openModal((modal) => (
                    <ModalExportDataSelect modal={modal} sections={makeSections(res.data.data)} onSuccess={onSuccess} />
                ));
            });
        },
        [makeSections, openModal, pushDanger, saveExportedData, setProgress, identityService],
    );

    return { exportData };
}
