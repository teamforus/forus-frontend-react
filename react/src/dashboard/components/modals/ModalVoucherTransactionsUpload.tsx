import React, { ChangeEvent, Fragment, useCallback, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import Organization from '../../props/models/Organization';
import { useFileService } from '../../services/FileService';
import Papa from 'papaparse';
import { chunk, isEmpty } from 'lodash';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import { dateFormat } from '../../helpers/dates';
import { useTranslation } from 'react-i18next';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import { ResponseError } from '../../props/ApiResponses';
import { fileSize } from '../../helpers/string';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useTransactionService from '../../services/TransactionService';

export default function ModalVoucherTransactionsUpload({
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
    const { t } = useTranslation();
    const authIdentity = useAuthIdentity();
    const fileService = useFileService();
    const transactionService = useTransactionService();

    const [progress, setProgress] = useState(1);
    const [changed, setChanged] = useState(false);
    const [progressBar, setProgressBar] = useState(0);
    const [progressStatus, setProgressStatus] = useState('');
    const [uploadedPartly, setUploadedPartly] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [data, setData] = useState([]);
    const [csvFile, setCsvFile] = useState(null);
    const [hideModal, setHideModal] = useState(false);
    const [dataChunkSize] = useState(100);
    const [maxLinesPerFile] = useState(2500);

    const openModal = useOpenModal();
    const fileInput = useRef(null);
    const dropBlock = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const closeModal = useCallback(() => {
        if (changed) {
            onCreated();
        }

        modal.close();
    }, [changed, modal, onCreated]);

    const makeDefaultNote = useCallback(
        (row: object): string => {
            return t('transactions.csv.default_note', {
                ...row,
                upload_date: dateFormat(new Date()),
                uploader_email: authIdentity?.email || authIdentity?.address,
            });
        },
        [authIdentity?.address, authIdentity?.email, t],
    );

    const validateCsvData = useCallback(
        (data) => {
            const error = data.length > maxLinesPerFile;
            const errorMessage = [
                `Het bestand mag niet meer dan ${maxLinesPerFile} transacties bevatten.`,
                `het huidige bestand bevat meer dan ${data.length} transacties.`,
            ].join(' ');

            setError(error ? errorMessage : null);

            return !error;
        },
        [maxLinesPerFile],
    );

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
                        .filter((row) => row.filter((col) => !isEmpty(col)).length > 0)
                        .map((val: Array<string>) => {
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
        (errors = {}, transactions = [], validation = false) => {
            const items = Object.keys(errors)
                .map(function (key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const index = parseInt(keyDataId, 10) + 1;

                    return [index, errors[key], transactions[keyDataId]];
                })
                .filter((arr) => !isNaN(arr[0]))
                .sort((a, b) => a[0] - b[0]);

            const uniqueRows = items.reduce((arr, item) => {
                return arr.includes(item[0]) ? arr : [...arr, item[0]];
            }, []);

            const message = [
                `Voor ${uniqueRows.length} van de ${transactions.length}`,
                `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                `bekijk het bestand bij welke rij(en) het mis gaat.`,
            ].join(' ');

            const messageValidation = [
                `Voor ${uniqueRows.length} van de ${transactions.length} rij(en) `,
                `in het bestand dat is geïmporteerd zijn fouten gevonden, bekijk de fouten hieronder. `,
                `Er zijn geen transacties geïmporteerd. Haal de fouten uit het CSV-bestand en probeer het opnieuw.`,
            ].join(' ');

            if (validation) {
                pushDanger('Waarschuwing', validation ? messageValidation : message);
                closeModal();
            } else {
                setHideModal(true);
            }

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Transactie aanmaken mislukt!'}
                    hero_subtitle={[validation ? messageValidation : message]}
                    enableToggles={false}
                    label_on={'Aanmaken'}
                    label_off={'Overslaan'}
                    items={items.map((item) => ({ value: `Rij: ${item[0]}: ${item[2]['uid'] || ''} - ${item[1]}` }))}
                    onConfirm={() => setHideModal(false)}
                    onCancel={() => setHideModal(false)}
                />
            ));
        },
        [closeModal, openModal, pushDanger],
    );

    const startValidationUploadingData = useCallback(
        function (transactions: Array<object>) {
            return new Promise((resolve, reject) => {
                transactionService
                    .storeBatchValidate(organization.id, { transactions })
                    .then((res) => resolve(res))
                    .catch((res: ResponseError) => {
                        reject(res.status == 422 ? res.data?.errors : res.data?.message || 'Onbekende foutmelding.');
                    });
            });
        },
        [organization.id, transactionService],
    );

    const startUploadingData = useCallback(
        function (
            transactions: Array<object>,
            onChunk: ({ chunk }: { chunk: number }) => void,
        ): Promise<{ success: number; errors: Array<object> }> {
            return new Promise((resolve) => {
                const stats = {
                    errors: [],
                    success: 0,
                };

                const chunks = chunk(transactions, dataChunkSize);
                let chunkCount = 0;

                const uploadChunk = (data: Array<object>) => {
                    const transformErrors = (errors: object) => {
                        return Object.keys(errors).reduce((obj, key) => {
                            const errorKey = key.split('.');
                            errorKey[1] = String(parseInt(errorKey[1]) + chunkCount * dataChunkSize);
                            return { ...obj, [errorKey.join('.')]: errors[key] };
                        }, {});
                    };

                    transactionService
                        .storeBatch(organization.id, { transactions: data })
                        .then((res) => {
                            stats.errors = { ...transformErrors(res.data['errors']), ...stats.errors };
                            stats.success = stats.success += res.data['created'].length || 0;

                            console.log(stats);
                            return stats;
                        })
                        .catch((res: ResponseError) => {
                            const message =
                                res.status == 422 ? 'Overgeslagen.' : res.data?.message || 'Onbekende foutmelding.';

                            const errors = transformErrors(
                                [...data.keys()].reduce(
                                    (errors, index) => ({ ...errors, [`transactions.${index}.amount`]: message }),
                                    {},
                                ),
                            );

                            console.log('ResponseError', res);

                            return (stats.errors = {
                                ...errors,
                                ...stats.errors,
                                ...transformErrors(res.data?.errors || {}),
                            });
                        })
                        .finally(() => {
                            chunkCount++;
                            onChunk({ chunk: chunkCount });

                            if (chunkCount == chunks.length) {
                                return resolve(stats);
                            }

                            uploadChunk(chunks[chunkCount]);
                        });
                };

                uploadChunk(chunks[chunkCount]);
            });
        },
        [dataChunkSize, organization.id, transactionService],
    );

    const startUploadingTransactions = useCallback(
        function (
            transactions: Array<object>,
        ): Promise<{ success: number; errors: Array<object>; validation: boolean; transactions: Array<object> }> {
            return new Promise((resolve) => {
                setProgress(2);
                setProgressBar(100);
                setProgressStatus('Bestand wordt gecontroleerd...');

                startValidationUploadingData(transactions).then(
                    () => {
                        const from = Math.min(transactions.length, dataChunkSize);
                        const to = transactions.length;

                        setLoading(true);
                        setProgressBar(0);
                        setProgressStatus(`Processing transactions from 1 to ${from} from ${to}`);

                        startUploadingData(transactions, (stats) => {
                            const progress = ((stats.chunk * dataChunkSize) / transactions.length) * 100;
                            const total = transactions.length;
                            const from = Math.min(stats.chunk * dataChunkSize + 1, total);
                            const to = Math.min((stats.chunk + 1) * dataChunkSize, total);

                            setProgressBar(progress);
                            setProgressStatus(`Processing transactions from ${from} to ${to} from ${total}`);
                        })
                            .then((stats) => resolve({ ...stats, validation: false, transactions }))
                            .finally(() => setLoading(false));
                    },
                    (errors) => {
                        const errorsList =
                            typeof errors === 'string'
                                ? [...transactions.keys()].reduce(
                                      (list, index) => ({ ...list, [`transactions.${index}.amount`]: errors }),
                                      {},
                                  )
                                : errors;

                        resolve({ errors: errorsList, success: 0, validation: true, transactions });
                        setProgress(1);
                    },
                );
            });
        },
        [startValidationUploadingData, dataChunkSize, startUploadingData],
    );

    const startUploading = useCallback(
        async function () {
            setProgress(2);
            setProgressBar(0);
            setProgressStatus('Aan het uploaden...');

            const stats = await startUploadingTransactions([...data].map((row) => ({ ...row })));

            setProgressBar(100);
            setProgressStatus('Klaar!');
            return stats;
        },
        [data, startUploadingTransactions],
    );

    const uploadToServer = useCallback(
        function (e) {
            e.preventDefault();
            e.stopPropagation();

            startUploading().then((stats) => {
                const { errors, success, validation, transactions } = stats;

                const errorsCount = Object.keys(errors).length;
                const hasErrors = errorsCount > 0;
                const hasSuccess = success > 0;

                setUploadedPartly(hasErrors && hasSuccess);
                setProgress(3);

                if (hasSuccess) {
                    setChanged(true);
                }

                if (hasErrors) {
                    showInvalidRows(errors, transactions, validation);

                    if (validation) {
                        return;
                    }
                }

                if (hasSuccess && !hasErrors) {
                    return pushSuccess('Gelukt!', `Alle ${success} rijen uit het bulkbestand zijn geimporteerd.`);
                }

                const allFailed = success === 0;

                pushDanger(
                    allFailed ? 'Foutmelding!' : 'Waarschuwing!',
                    [
                        allFailed ? `Alle ${errorsCount}` : `${errorsCount} van ${transactions.length}`,
                        `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                        `bekijk het bestand bij welke rij(en) het mis gaat.`,
                    ].join(' '),
                );
            });
        },
        [pushDanger, pushSuccess, showInvalidRows, startUploading],
    );

    const downloadExampleCsv = useCallback(() => {
        fileService.downloadFile('transaction_upload_sample.csv', transactionService.sampleCsvTransactions());
    }, [fileService, transactionService]);

    const reset = useCallback(function () {
        setData(null);
        setError(null);
        setCsvFile(null);
    }, []);

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                modal.loading || hideModal ? 'modal-loading' : null,
                className,
            ])}
            data-dusk="modalTransactionUpload">
            <div className="modal-backdrop" onClick={closeModal} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                <div className="modal-header">Upload bulkbestand</div>
                <div className="modal-body form">
                    <input
                        type="file"
                        accept={'.csv'}
                        hidden={true}
                        onChange={onFileChange}
                        ref={fileInput}
                        data-dusk="inputUpload"
                    />
                    <div className="modal-section form">
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
                                            <button
                                                className="button button-primary"
                                                onClick={selectFile}
                                                data-dusk="selectFileButton">
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
                                            {progress == 3 && !uploadedPartly && (
                                                <div className="mdi mdi-check" data-dusk="successUploadIcon" />
                                            )}
                                            {progress == 3 && uploadedPartly && (
                                                <div className="mdi mdi-alert-outline" />
                                            )}
                                        </div>

                                        <div className="csv-progress">
                                            <div className="csv-progress-state">{progressStatus}</div>
                                            <div className="csv-progress-bar">
                                                <div
                                                    className="csv-progress-bar-stick"
                                                    style={{ width: `${progressBar}%` }}
                                                />
                                            </div>
                                            <div className="csv-progress-value">{progressBar.toFixed(2) + '%'}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="csv-upload-actions">
                                    {csvFile && progress < 2 && (
                                        <div className="csv-file">
                                            <div className={`block block-file ${isValid ? '' : 'has-error'}`}>
                                                <div className="file-error mdi mdi-close-circle" />
                                                <div className="file-name">{csvFile.name}</div>
                                                <div className="file-size">{fileSize(csvFile.size)}</div>
                                                <div className="file-remove mdi mdi-close" onClick={reset} />
                                            </div>
                                            {!isValid && error && (
                                                <div className="text-center">
                                                    <div className="form-error">{error}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {progress == 1 && isValid && (
                                        <div className="text-center">
                                            {!loading && (
                                                <button
                                                    className="button button-primary"
                                                    onClick={uploadToServer}
                                                    data-dusk="uploadFileButton">
                                                    {t('csv_upload.buttons.upload')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button
                        className="button button-primary"
                        onClick={closeModal}
                        disabled={loading}
                        id="close"
                        data-dusk="closeModalButton">
                        {t('modal_funds_add.buttons.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
