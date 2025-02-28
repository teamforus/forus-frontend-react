import React, { useCallback } from 'react';
import ModalExportTypeLegacy from '../../../modals/ModalExportTypeLegacy';
import { format } from 'date-fns';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useFileService } from '../../../../services/FileService';
import { useFundService } from '../../../../services/FundService';
import Organization from '../../../../props/models/Organization';
import useEnvData from '../../../../hooks/useEnvData';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function useExportFunds(organization: Organization) {
    const envData = useEnvData();

    const openModal = useOpenModal();
    const pushApiError = usePushApiError();

    const fileService = useFileService();
    const fundService = useFundService();

    const doExport = useCallback(
        (exportType: string, detailed: boolean, year: number) => {
            fundService
                .financialOverviewExport(organization.id, {
                    export_type: exportType,
                    detailed: detailed ? 1 : 0,
                    year: year,
                })
                .then((res) => {
                    const dateTime =
                        year != new Date().getFullYear() ? year : format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    const fileName = `${envData.client_type}_${organization.name}_${dateTime}.${exportType}`;
                    const fileType = res.headers['content-type'] + ';charset=utf-8;';

                    fileService.downloadFile(fileName, res.data, fileType);
                })
                .catch(pushApiError);
        },
        [fundService, organization.id, organization.name, envData.client_type, fileService, pushApiError],
    );

    return useCallback(
        (detailed: boolean, year?: number) => {
            openModal((modal) => (
                <ModalExportTypeLegacy modal={modal} onSubmit={(exportType) => doExport(exportType, detailed, year)} />
            ));
        },
        [doExport, openModal],
    );
}
