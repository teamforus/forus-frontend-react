import React, { ChangeEvent, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import Organization from '../../props/models/Organization';
import useProductReservationService from '../../services/ProductReservationService';
import { useFileService } from '../../services/FileService';
import Papa from 'papaparse';
import { isEmpty } from 'lodash';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import { dateFormat } from '../../helpers/dates';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import { ResponseError } from '../../props/ApiResponses';
import { fileSize } from '../../helpers/string';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import CSVProgressBar from '../elements/csv-progress-bar/CSVProgressBar';
import classNames from 'classnames';
import useTranslate from '../../hooks/useTranslate';

export default function ModalReservationUpload({
    modal,
    className,
    onCreated,
    organization,
}: {
    modal: ModalState;
    className?: string;
    onCreated: () => void;
    organization: Organization;
}) {
    const authIdentity = useAuthIdentity();

    const openModal = useOpenModal();
    const translate = useTranslate();

    const fileService = useFileService();
    const productReservationService = useProductReservationService();

    const [progress, setProgress] = useState(1);
    const [changed, setChanged] = useState(false);
    const [progressBar, setProgressBar] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const [uploadedPartly, setUploadedPartly] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [data, setData] = useState([]);
    const [csvFile, setCsvFile] = useState(null);
    const [hideModal, setHideModal] = useState(false);

    const fileInput = useRef(null);
    const dropBlock = useRef(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        csvMissingProductIdFields: string;
        csvMissingNumberFields: string;
        csvSampleNumberFields: string;
    }>(null);

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const closeModal = useCallback(() => {
        if (changed) {
            onCreated();
        }

        modal.close();
    }, [changed, modal, onCreated]);

    const makeDefaultNote = useCallback(
        function (row: object): string {
            return translate('reservations.csv.default_note', {
                ...row,
                upload_date: dateFormat(new Date()),
                uploader_email: authIdentity?.email || authIdentity?.address,
            });
        },
        [authIdentity?.address, authIdentity?.email, translate],
    );

    const validateCsvData = useCallback(function (data) {
        const localErrors = {
            // rows without `product_id` field
            csvMissingProductIdFields: data
                .map((row: object, key: string) => (!row['product_id'] ? key + 1 : null))
                .filter((row?: object) => row !== null)
                .join(', '),
            // rows without `number` field
            csvMissingNumberFields: data
                .map((row: object, key: string) => (!row['number'] ? key + 1 : null))
                .filter((row?: object) => row !== null)
                .join(', '),
            // rows without `number` field
            csvSampleNumberFields: data
                .map((row: object, key: string) => (row['number'] === '000000000000' ? key + 1 : null))
                .filter((row?: object) => row !== null)
                .join(', '),
        };

        setErrors(localErrors);

        return (
            data.length > 0 &&
            !localErrors.csvSampleNumberFields &&
            !localErrors.csvMissingProductIdFields &&
            !localErrors.csvMissingNumberFields
        );
    }, []);

    const uploadFile = useCallback(
        async (file: File) => {
            if (!file.name.endsWith('.csv')) {
                return;
            }

            Papa.parse(file, {
                complete: (res) => {
                    const body = res.data as Array<Array<string>>;
                    const header = res.data.shift() as Array<string>;

                    // clean empty rows, trim fields and add default note
                    const data = body
                        .filter((row) => {
                            return row.filter((col) => !isEmpty(col)).length > 0;
                        })
                        .map((val) => {
                            const row = {};

                            header.forEach((hVal, hKey) => {
                                if (val[hKey] && val[hKey] != '') {
                                    row[hVal.trim()] = val[hKey].trim();
                                }
                            });

                            row['note'] = row['note'] || makeDefaultNote(row);

                            return isEmpty(row) ? false : row;
                        })
                        .filter((row) => !!row);

                    setIsValid(validateCsvData(data));
                    setData(data);
                    setCsvFile(file);
                    setProgress(1);
                },
            });
        },
        [makeDefaultNote, validateCsvData],
    );

    const onFileChange = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
            await uploadFile(e.target.files[0]).then();
            e.target.value = null;
        },
        [uploadFile],
    );

    const selectFile = useCallback(function (e) {
        e?.preventDefault();
        e?.stopPropagation();

        fileInput.current?.click();
    }, []);

    const showInvalidRows = useCallback(
        (errors = {}, reservations = [], validation = false) => {
            const items = Object.keys(errors).map(function (key) {
                const keyData = key.split('.');
                const keyDataId = keyData[keyData.length - 1];

                return [keyDataId, errors[key], reservations[keyDataId]];
            });

            const count_errors = Object.values(errors).length;

            if (validation) {
                pushDanger('Foutmelding!', `Kan geen reserveringen aanmaken voor ${count_errors} rij(en).`);
                closeModal();
            } else {
                setHideModal(true);
            }

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Reserveringen aanmaken mislukt!'}
                    hero_subtitle={[
                        'Voor onderstaande nummers kan een reserveringen worden aangemaakt. Er is geen actief tegoed beschikbaar of het gebruikerslimiet is bereikt.\n' +
                            'Om de reserveringen alsnog aan te maken dient het bestand aangepast en opnieuw aangeboden te worden.',
                    ]}
                    enableToggles={true}
                    label_on={'Aanmaken'}
                    label_off={'Overslaan'}
                    items={items.map((item) => ({
                        value: item[2]?.['number'] ? item[2]?.['number'] + ' - ' + item[1] : item[1],
                    }))}
                    onConfirm={() => setHideModal(false)}
                    onCancel={() => setHideModal(false)}
                />
            ));
        },
        [closeModal, openModal, pushDanger],
    );

    const startUploadingData = useCallback(
        function (reservations: Array<object>): Promise<{ success: number; errors: number }> {
            return new Promise((resolve) => {
                const data = { reservations };

                setLoading(true);

                productReservationService
                    .storeBatch(organization.id, data)
                    .then((res) => {
                        const hasErrors = res.data['errors'] && typeof res.data['errors'] === 'object';

                        const stats = {
                            success: res.data['reserved'].length,
                            errors: hasErrors ? Object.keys(res.data['errors']).length : 0,
                        };

                        if (stats.errors === 0) {
                            pushSuccess(
                                'Gelukt!',
                                `Alle ${stats.success} rijen uit het bulkbestand zijn geimporteerd.`,
                            );
                        } else {
                            const allFailed = stats.success === 0;

                            pushDanger(
                                allFailed ? 'Foutmelding!' : 'Waarschuwing',
                                [
                                    allFailed ? `Alle ${stats.errors}` : `${stats.errors} van ${reservations.length}`,
                                    `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                                    `bekijk het bestand bij welke rij(en) het mis gaat.`,
                                ].join(' '),
                            );

                            showInvalidRows(res.data['errors'], reservations);
                        }

                        resolve(stats);
                    })
                    .catch((res: ResponseError) => {
                        if (res.status == 422 && res.data.errors) {
                            showInvalidRows(res.data.errors, reservations, true);
                        }
                    })
                    .finally(() => setLoading(false));
            });
        },
        [organization.id, productReservationService, pushDanger, pushSuccess, showInvalidRows],
    );

    const startUploading = useCallback(
        async function () {
            setProgress(2);
            setProgressBar(0);

            const stats = await startUploadingData([...data].map((row) => ({ ...row })));
            setProgressBar(100);
            return stats;
        },
        [data, startUploadingData],
    );

    const uploadToServer = useCallback(
        function (e) {
            e.preventDefault();
            e.stopPropagation();

            startUploading().then((stats) => {
                setProgress(3);
                setUploadedPartly(stats['errors'] !== 0);

                if (stats['success'] > 0) {
                    setChanged(true);
                }
            });
        },
        [startUploading],
    );

    const downloadExampleCsv = useCallback(() => {
        fileService.downloadFile(
            'product_reservation_upload_sample.csv',
            productReservationService.sampleCsvProductReservations(),
        );
    }, [fileService, productReservationService]);

    const reset = useCallback(function () {
        setIsValid(false);
        setData(null);
        setCsvFile(null);
    }, []);

    useEffect(() => {
        if (progress < 100) {
            setProgressStatus('Aan het uploaden...');
        } else {
            setProgressStatus('Klaar!');
        }
    }, [progress]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                (modal.loading || hideModal) && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={closeModal} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                <div className="modal-header">Upload bulkbestand</div>
                <div className="modal-body form">
                    <input type="file" accept={'.csv'} hidden={true} onChange={onFileChange} ref={fileInput} />
                    <Fragment>
                        <div
                            ref={dropBlock}
                            className="block block-csv condensed"
                            onDragLeave={(e) => {
                                e?.preventDefault();
                                dropBlock?.current?.classList.remove('on-dragover');
                            }}
                            onDragOver={(e) => {
                                e?.preventDefault();
                                dropBlock?.current?.classList.add('on-dragover');
                            }}
                            onDrop={(e) => {
                                e?.preventDefault();
                                dropBlock?.current?.classList.remove('on-dragover');
                                uploadFile(e.dataTransfer.files[0]).then();
                            }}>
                            <div className="csv-inner">
                                {progress <= 1 && (
                                    <Fragment>
                                        <div className="csv-upload-btn" onClick={selectFile}>
                                            <div className="csv-upload-icon">
                                                <div className="mdi mdi-upload" />
                                            </div>
                                            <div className="csv-upload-text">
                                                Upload .csv bestand
                                                <br />
                                                <span>Sleep hier het *.CSV of *.TXT bestand</span>
                                            </div>
                                        </div>
                                        <div className="button-group flex-center">
                                            <button className="button button-default" onClick={downloadExampleCsv}>
                                                <em className="mdi mdi-file-table-outline icon-start" />
                                                Download voorbeeld bulkbestand
                                            </button>
                                            <button className="button button-primary" onClick={selectFile}>
                                                <em className="mdi mdi-upload icon-start" />
                                                Upload bulkbestand
                                            </button>
                                        </div>
                                    </Fragment>
                                )}
                                {progress >= 2 && (
                                    <div className={`csv-upload-progress ${progress === 3 ? 'done' : ''}`}>
                                        <div
                                            className={`csv-upload-icon ${
                                                uploadedPartly ? 'csv-upload-icon-warning' : ''
                                            }`}>
                                            {progress == 2 && <div className="mdi mdi-loading" />}
                                            {progress == 3 && !uploadedPartly && <div className="mdi mdi-check" />}
                                            {progress == 3 && uploadedPartly && (
                                                <div className="mdi mdi-alert-outline" />
                                            )}
                                        </div>

                                        <CSVProgressBar status={progressStatus} progressBar={progressBar} />
                                    </div>
                                )}
                                <div className="csv-upload-actions">
                                    {csvFile && progress < 2 && (
                                        <Fragment>
                                            <div className={classNames(`block block-file`, !isValid && 'has-error')}>
                                                <div className="file-icon">
                                                    {isValid ? (
                                                        <div className="mdi mdi-file-outline" />
                                                    ) : (
                                                        <div className="mdi mdi-close-circle" />
                                                    )}
                                                </div>
                                                <div className="file-details">
                                                    <div className="file-name">{csvFile.name}</div>
                                                    <div className="file-size">{fileSize(csvFile.size)}</div>
                                                </div>
                                                <div className="file-remove mdi mdi-close" onClick={reset} />
                                            </div>
                                            {!isValid && (
                                                <div className="text-left">
                                                    {errors?.csvMissingProductIdFields && (
                                                        <div className="form-error">
                                                            De kolom `product_id` mist waardes op de volgende rijen:
                                                            {` "${errors.csvMissingProductIdFields}".`}
                                                        </div>
                                                    )}
                                                    {errors?.csvMissingNumberFields && (
                                                        <div className="form-error">
                                                            De kolom `number` mist waardes op de volgende rijen:
                                                            {` "${errors.csvMissingNumberFields}".`}
                                                        </div>
                                                    )}
                                                    {errors?.csvSampleNumberFields && (
                                                        <div className="form-error">
                                                            De kolom `product_id` heeft de voorbeeld waarde
                                                            {` "000000000000"`} op de volgende rijen:
                                                            {` "${errors.csvSampleNumberFields}".`}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Fragment>
                                    )}
                                    {progress == 1 && isValid && (
                                        <div className="text-center">
                                            {!loading && (
                                                <button className="button button-primary" onClick={uploadToServer}>
                                                    {translate('csv_upload.buttons.upload')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Fragment>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-primary" onClick={closeModal} id="close">
                        {translate('modal_funds_add.buttons.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
