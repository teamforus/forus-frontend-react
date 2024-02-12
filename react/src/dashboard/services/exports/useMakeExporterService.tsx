import { useCallback, useState } from 'react';
import { ExportFieldProp, ExportSectionProp } from '../../components/modals/ModalExportDataSelect';
import { format } from 'date-fns';
import { useFileService } from '../FileService';
import usePushSuccess from '../../hooks/usePushSuccess';
import useSetProgress from '../../hooks/useSetProgress';
import useEnvData from '../../hooks/useEnvData';

export default function useMakeExporterService() {
    const fileService = useFileService();
    const envData = useEnvData();

    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const [dataFormats] = useState<Array<ExportFieldProp>>([
        { value: 'csv', label: 'Exporteren CSV', icon: 'file-delimited-outline' },
        { value: 'xls', label: 'Exporteren XLS', icon: 'file-excel-outline' },
    ]);

    const makeSections = useCallback(
        (fields: Array<ExportFieldProp>): Array<ExportSectionProp> => [
            {
                type: 'radio',
                key: 'data_format',
                fields: dataFormats,
                value: 'csv',
                title: 'Kies bestandsformaat',
            },
            {
                type: 'checkbox',
                key: 'fields',
                fields,
                fieldsPerRow: 3,
                selectAll: true,
                title: 'Kies inbegrepen velden',
            },
        ],
        [dataFormats],
    );

    const saveExportedData = useCallback(
        (data, organization_id, res) => {
            const headers = res.response.getAllResponseHeaders();
            const headersList = headers.trim().split(/[\r\n]+/);

            const headerMap = headersList?.reduce((headerMap: object, line: string) => {
                const parts = line.split(': ');
                const header = parts.shift();

                return { ...headerMap, [header]: parts.join(': ') };
            }, {});

            pushSuccess('Gelukt!', 'The downloading should start shortly.');

            const fileName = [
                envData.client_type,
                organization_id,
                format(new Date(), 'yyyy-MM-dd HH:mm:ss') + '.' + data.data_format,
            ].join('_');

            fileService.downloadFile(fileName, res.data, headerMap['content-type']);
            setProgress(100);
        },
        [envData.client_type, fileService, pushSuccess, setProgress],
    );

    return {
        makeSections,
        saveExportedData,
    };
}