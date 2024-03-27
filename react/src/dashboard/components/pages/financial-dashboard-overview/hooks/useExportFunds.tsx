import React, { useCallback } from 'react';
import ModalExportTypeLegacy from '../../../modals/ModalExportTypeLegacy';
import { format } from 'date-fns';
import { ResponseError } from '../../../../props/ApiResponses';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useFileService } from '../../../../services/FileService';
import { useFundService } from '../../../../services/FundService';
import Organization from '../../../../props/models/Organization';
import useEnvData from '../../../../hooks/useEnvData';
import usePushDanger from '../../../../hooks/usePushDanger';

export default function useExportFunds(organization: Organization) {
    const envData = useEnvData();

    const openModal = useOpenModal();
    const pushDanger = usePushDanger();

    const fileService = useFileService();
    const fundService = useFundService();

    const doExport = useCallback(
        (exportType: string, detailed: boolean) => {
            fundService
                .financialOverviewExport(organization.id, {
                    export_type: exportType,
                    detailed: detailed ? 1 : 0,
                })
                .then((res) => {
                    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    const fileName = `${envData.client_type}_${organization.name}_${dateTime}.${exportType}`;
                    const fileType = res.headers['content-type'] + ';charset=utf-8;';

                    fileService.downloadFile(fileName, res.data, fileType);
                })
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
        },
        [fundService, organization?.id, organization?.name, envData.client_type, fileService, pushDanger],
    );

    return useCallback(
        (detailed: boolean) => {
            openModal((modal) => (
                <ModalExportTypeLegacy modal={modal} onSubmit={(exportType) => doExport(exportType, detailed)} />
            ));
        },
        [doExport, openModal],
    );
}
