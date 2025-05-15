import { useCallback, useState } from 'react';
import { ExportFieldProp, ExportSectionProp } from '../../../components/modals/ModalExportDataSelect';
import { format } from 'date-fns';
import { useFileService } from '../../FileService';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import { ResponseSimple } from '../../../props/ApiResponses';

export default function useMakeExporterService() {
    const fileService = useFileService();
    const envData = useEnvData();

    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const [defaultDataFormats] = useState<Array<ExportFieldProp>>([
        { value: 'csv', label: 'Exporteren CSV', icon: 'file-delimited-outline' },
        { value: 'xls', label: 'Exporteren XLS', icon: 'file-excel-outline' },
    ]);

    const makeSections = useCallback(
        (
            fields: Array<ExportFieldProp>,
            record_fields = [],
            data_formats: Array<ExportFieldProp> = null,
            qr_formats: Array<ExportFieldProp> = null,
        ): Array<ExportSectionProp> => {
            const sections: Array<ExportSectionProp> = [
                {
                    type: 'radio',
                    key: 'data_format',
                    fields: data_formats ? data_formats : defaultDataFormats,
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
                    collapsable: true,
                },
            ];

            if (record_fields?.length > 0) {
                sections.push({
                    type: 'checkbox',
                    key: 'extra_fields',
                    fields: record_fields,
                    fieldsPerRow: 3,
                    selectAll: true,
                    title: 'Persoonsgegevens',
                    collapsable: true,
                    collapsed: true,
                });
            }

            if (qr_formats?.length > 0) {
                sections.push({
                    type: 'radio',
                    key: 'qr_format',
                    fields: qr_formats,
                    value: 'null',
                    title: 'QR-codes bijvoegen',
                });
            }

            return sections;
        },
        [defaultDataFormats],
    );

    const saveExportedData = useCallback(
        (
            data: { data_format: string; fields: string },
            organization_id: number,
            res: ResponseSimple<ArrayBuffer>,
            suffix = null,
        ) => {
            pushSuccess('Gelukt!', 'Het downloaden begint binnenkort.');

            const fileName = [
                envData.client_type,
                organization_id,
                suffix,
                format(new Date(), 'yyyy-MM-dd HH:mm:ss') + '.' + data.data_format,
            ]
                .filter((item) => item)
                .join('_');

            fileService.downloadFile(fileName, res.data, res.headers['content-type']);
            setProgress(100);
        },
        [envData.client_type, fileService, pushSuccess, setProgress],
    );

    return {
        makeSections,
        saveExportedData,
    };
}
