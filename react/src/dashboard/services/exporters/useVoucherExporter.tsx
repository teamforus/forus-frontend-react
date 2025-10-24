import React, { useCallback, useState } from 'react';
import usePushDanger from '../../hooks/usePushDanger';
import useSetProgress from '../../hooks/useSetProgress';
import useOpenModal from '../../hooks/useOpenModal';
import ModalExportDataSelect, { ExportFieldProp } from '../../components/modals/ModalExportDataSelect';
import useMakeExporterService from './hooks/useMakeExporterService';
import useVoucherService from '../VoucherService';
import { useFileService } from '../FileService';
import JSZip from 'jszip';
import { uniqueId } from 'lodash';
import QRCode from 'easyqrcodejs';
import useTranslate from '../../hooks/useTranslate';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { makeQrCodeContent } from '../../helpers/utils';

export default function useVoucherExporter() {
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushApiError = usePushApiError();

    const voucherService = useVoucherService();
    const fileService = useFileService();
    const { makeSections } = useMakeExporterService();

    const [dataFormats] = useState<Array<ExportFieldProp>>([
        {
            value: 'csv',
            label: translate('modals.modal_export_data.modal_section.export_type_csv'),
            icon: 'file-delimited-outline',
        },
        {
            value: 'xls',
            label: translate('modals.modal_export_data.modal_section.export_type_xls'),
            icon: 'file-excel-outline',
        },
        {
            value: 'all',
            label: translate('modals.modal_export_data.modal_section.export_type_all'),
            icon: 'file-outline',
        },
    ]);

    const [qrFormats] = useState<Array<ExportFieldProp>>([
        { value: 'null', label: translate('modals.modal_export_data.modal_section.export_type_none'), icon: 'cancel' },
        {
            value: 'pdf',
            label: translate('modals.modal_export_data.modal_section.export_type_pdf'),
            icon: 'file-pdf-box',
        },
        {
            value: 'png',
            label: translate('modals.modal_export_data.modal_section.export_type_png'),
            icon: 'image-outline',
        },
    ]);

    const makeQrCode = useCallback((qrValue: string): string => {
        const elementId = `#${qrValue}`;
        const $el = document.body.appendChild(document.createElement('div'));

        $el.id = elementId;
        $el.style.display = 'none';

        new QRCode(elementId, { text: makeQrCodeContent('voucher', qrValue) });

        return document.getElementById(elementId).querySelector('canvas').toDataURL();
    }, []);

    const saveExportedData = useCallback(
        (
            res: { data: Array<{ name?: string; value?: string }>; files: { csv: string; zip: string }; name: string },
            qrFormat: string,
        ) => {
            const fileTypes = {
                xls: 'application/vnd.ms-excel',
                csv: 'text/csv',
                zip: 'application/zip',
            };

            return new Promise((resolve) => {
                const { data, name } = res;
                const zipName = `${name}.zip`;

                const files: { csv: Blob; zip: Blob } = Object.keys(res.files).reduce(
                    (files, fileKey) => {
                        return {
                            ...files,
                            [fileKey]: fileService.base64ToBlob(res.files[fileKey], fileTypes[fileKey]),
                        };
                    },
                    { csv: null, zip: null },
                );

                if (!qrFormat || qrFormat === 'pdf') {
                    fileService.downloadFile(zipName, files.zip, fileTypes.zip);
                    return resolve(false);
                }

                JSZip.loadAsync(files.zip)
                    .then(function (zip) {
                        const imagesDirName = `${name}_QR_codes_images`;
                        const imgDirectory = data.length > 0 ? zip.folder(imagesDirName) : null;

                        const promises = data.map(async (voucherData, index) => {
                            console.info('- making qr file ' + (index + 1) + ' from ' + data.length + '.');

                            const imageData = makeQrCode(voucherData.value);
                            const imageDataValue = imageData.slice('data:image/png;base64,'.length);

                            return { ...voucherData, data: imageDataValue };
                        });

                        Promise.all(promises)
                            .then((data) => {
                                console.info('- inserting images into .zip archive.');

                                data.forEach((img) => {
                                    imgDirectory.file(uniqueId() + '.png', img.data, { base64: true });
                                });

                                setProgress(80);

                                zip.generateAsync({ type: 'blob' })
                                    .then(function (content) {
                                        console.info('- downloading .zip file.');

                                        fileService.downloadFile(zipName, content);
                                        resolve(false);
                                    })
                                    .catch(() => resolve('Failed to generate blob .zip file.'));
                            })
                            .catch(() => resolve('Failed to build the qr-code .png file.'));
                    })
                    .catch(() => resolve('Failed to open the .zip file.'));
            });
        },
        [fileService, setProgress, makeQrCode],
    );

    const exportData = useCallback(
        (organization_id: number, allow_voucher_records = false, filters = {}, type = 'budget') => {
            const onSuccess = (data: {
                data_format: string;
                fields: Array<object>;
                extra_fields: Array<object>;
                qr_format: string;
            }) => {
                const { qr_format, data_format, fields, extra_fields = [] } = data;
                const queryFilters = {
                    ...filters,
                    ...{ data_format, fields: [...fields, ...extra_fields] },
                    ...{ qr_format: qr_format == 'png' ? 'data' : qr_format },
                };

                setProgress(0);
                console.info('- data loaded from the api.');

                voucherService
                    .export(organization_id, queryFilters)
                    .then((res) => {
                        saveExportedData(res.data, data.qr_format)
                            .then((error: string) => {
                                if (error) {
                                    return pushDanger('Error!', error);
                                }

                                pushSuccess('Succes!', 'De download begint over enkele ogenblikken.');
                            }, console.error)
                            .finally(() => setProgress(100));
                    })
                    .catch(pushApiError)
                    .finally(() => setProgress(100));
            };

            voucherService.exportFields(organization_id, { ...filters, type: type }).then((res) => {
                const fields = res.data.data.filter((field) => !field.is_record_field);
                const extra_fields = allow_voucher_records
                    ? res.data.data.filter((field) => field.is_record_field)
                    : [];

                openModal((modal) => (
                    <ModalExportDataSelect
                        modal={modal}
                        sections={makeSections(fields, extra_fields, dataFormats, qrFormats)}
                        onSuccess={onSuccess}
                    />
                ));
            });
        },
        [
            dataFormats,
            makeSections,
            openModal,
            pushDanger,
            pushSuccess,
            qrFormats,
            saveExportedData,
            setProgress,
            voucherService,
            pushApiError,
        ],
    );

    return { exportData };
}
