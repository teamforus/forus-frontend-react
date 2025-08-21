import React, { Fragment, useCallback, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import Fund from '../../props/models/Fund';
import { useFileService } from '../../services/FileService';
import { fileSize } from '../../helpers/string';
import Papa from 'papaparse';
import { chunk, isEmpty, uniqueId } from 'lodash';
import Organization from '../../props/models/Organization';
import usePushDanger from '../../hooks/usePushDanger';
import { ResponseError } from '../../props/ApiResponses';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useOpenModal from '../../hooks/useOpenModal';
import CSVProgressBar from '../elements/csv-progress-bar/CSVProgressBar';
import useTranslate from '../../hooks/useTranslate';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import classNames from 'classnames';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import usePushInfo from '../../hooks/usePushInfo';
import usePayoutTransactionService from '../../services/PayoutTransactionService';
import { fileToText } from '../../helpers/utils';

type CSVErrorProp = {
    csvHasBsnWhileNotAllowed?: boolean;
    csvAmountMissing?: boolean;
    invalidAmountField?: boolean;
    invalidPerVoucherAmount?: boolean;
    hasAmountField?: boolean;
    hasInvalidFundIds?: boolean;
    hasInvalidFundIdsList?: string;
};

type RowDataProp = {
    amount?: number;
    amount_preset?: number;
    description?: string;
    target_name?: string;
    target_iban?: string;
};

export default function ModalPayoutsUpload({
    funds,
    modal,
    fundId,
    className,
    onCompleted,
    organization,
}: {
    funds: Array<Partial<Fund>>;
    modal: ModalState;
    fundId?: number;
    className?: string;
    onCompleted: () => void;
    organization: Organization;
}) {
    const pushInfo = usePushInfo();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();

    const fileService = useFileService();
    const payoutTransactionService = usePayoutTransactionService();

    const [STEP_SET_UP] = useState(1);
    const [STEP_UPLOAD] = useState(2);

    const [data, setData] = useState<Array<RowDataProp>>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [changed, setChanged] = useState<boolean>(false);
    const [csvFile, setCsvFile] = useState<File>(null);
    const [hideModal, setHideModal] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dataChunkSize] = useState<number>(10);

    const [csvErrors, setCsvErrors] = useState<CSVErrorProp>({});
    const [csvIsValid, setCsvIsValid] = useState(false);
    const [csvProgress, setCsvProgress] = useState<number>(0);

    const [fund, setFund] = useState<Partial<Fund>>(funds?.find((fund) => fund.id == fundId) || funds[0]);
    const [step, setStep] = useState(STEP_SET_UP);
    const [progressBar, setProgressBar] = useState<number>(0);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [acceptedFiles] = useState(['.csv']);

    const abortRef = useRef<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const closeModal = useCallback(() => {
        if (loading) {
            return pushInfo('Bezig met uploaden.');
        }

        if (changed) {
            onCompleted();
        }

        modal.close();
    }, [changed, loading, modal, onCompleted, pushInfo]);

    const downloadExampleCsv = useCallback(() => {
        fileService.downloadFile('payout_upload_sample.csv', payoutTransactionService.sampleCsv());
    }, [fileService, payoutTransactionService]);

    const setLoadingBarProgress = useCallback((progress, status = null) => {
        setProgressBar(progress);
        setProgressStatus(status);
    }, []);

    const reset = useCallback((abortRefValue = true) => {
        abortRef.current = abortRefValue;

        setCsvFile(null);
        setCsvErrors({});
        setCsvIsValid(false);
        setCsvProgress(null);
    }, []);

    const getStatus = useCallback((fund: Partial<Fund>, validation = false) => {
        return validation ? `Gegevens valideren voor ${fund.name}...` : `Gegevens uploaden voor ${fund.name}...`;
    }, []);

    const filterSelectedFiles = useCallback(
        (files: FileList) => {
            return [...files].filter((file) => {
                return acceptedFiles.includes('.' + file.name.split('.')[file.name.split('.').length - 1]);
            });
        },
        [acceptedFiles],
    );

    const validateCsvData = useCallback(
        (data: Array<RowDataProp>) => {
            const fundBudget = parseFloat(fund.limit_sum_vouchers);

            const csvTotalAmount: number = data.reduce(
                (sum: number, row) => sum + (parseFloat((row.amount_preset || row.amount)?.toString()) || 0),
                0,
            );

            const invalidPerVoucherAmount = data.filter((row) => {
                return parseFloat((row.amount_preset || row.amount).toString()) > parseFloat(fund.limit_per_voucher);
            });

            csvErrors.csvAmountMissing = data.filter((row) => !row.amount_preset && !row.amount).length > 0;
            csvErrors.invalidAmountField = csvTotalAmount > fundBudget;
            csvErrors.invalidPerVoucherAmount = invalidPerVoucherAmount.length > 0;

            setCsvErrors({ ...csvErrors });

            return !csvErrors.invalidAmountField && !csvErrors.csvAmountMissing && !csvErrors.invalidPerVoucherAmount;
        },
        [csvErrors, fund.limit_per_voucher, fund.limit_sum_vouchers],
    );

    const transformCsvData = useCallback((rawData: Array<Array<string>>) => {
        const header = rawData[0].filter((value: string) => value);
        const body = rawData.slice(1).filter((row: Array<string>) => row.filter((col) => !isEmpty(col)).length > 0);

        return [header, ...body];
    }, []);

    const showInvalidRows = useCallback(
        (errors = {}, payouts: Array<RowDataProp>) => {
            const items = Object.keys(errors)
                .map(function (key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const index = parseInt(keyDataId, 10) + 1;
                    const errorKey = key.split('.')[key.split('.').length - 1];
                    const errorKeyValue = payouts[keyDataId][errorKey];

                    return [index, errors[key], payouts[keyDataId], errorKeyValue, errorKey];
                })
                .sort((a, b) => a[0] - b[0]);

            const uniqueRows = items.reduce((arr, item) => {
                return arr.includes(item[0]) ? arr : [...arr, item[0]];
            }, []);

            const message = [
                `${uniqueRows.length} van ${payouts.length}`,
                `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                `bekijk het bestand bij welke rij(en) het mis gaat.`,
            ].join(' ');

            pushDanger('Waarschuwing', message);

            setHideModal(true);

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Er zijn fouten opgetreden bij het importeren van de uitbetalingen'}
                    hero_subtitle={message}
                    enableToggles={false}
                    label_on={'Aanmaken'}
                    label_off={'Overslaan'}
                    items={items.map((item) => ({
                        _uid: uniqueId('rand_'),
                        label: `Rij: ${item[0]}: ${item[3] || item[2]['email'] || item[2]['bsn'] || ''} - ${item[1]}`,
                    }))}
                    onConfirm={() => window.setTimeout(() => setHideModal(false), 300)}
                    onCancel={() => window.setTimeout(() => setHideModal(false), 300)}
                />
            ));
        },
        [openModal, pushDanger],
    );

    const parseCsvFile = useCallback(
        async (file: File): Promise<Papa.ParseResult<Array<string>>> => {
            return await new Promise(function (complete) {
                try {
                    Papa.parse(file, { complete });
                } catch (e) {
                    pushDanger(e);
                    complete(null);
                }
            });
        },
        [pushDanger],
    );

    const uploadFile = useCallback(
        async (file?: File) => {
            const results = await parseCsvFile(file);

            if (!results) {
                return reset();
            }

            const csvData = transformCsvData((results.data = results.data.filter((item) => !!item)));
            const header = csvData.shift();
            const body = csvData.filter((row) => Array.isArray(row) && row.filter((item) => !!item).length > 0);

            setCsvFile(file);

            const data = body
                .map((item) => {
                    const row: RowDataProp = {};

                    header.forEach((hVal: string, hKey: number) => {
                        if (item[hKey] && item[hKey] != '') {
                            row[hVal.trim()] = typeof item[hKey] === 'object' ? item[hKey] : item[hKey].trim();
                        }
                    });

                    return isEmpty(row) ? null : row;
                })
                .filter((row) => !!row);

            setCsvIsValid(validateCsvData(data));
            setData(data);
            setCsvFile(file);
            setCsvProgress(1);
        },
        [parseCsvFile, reset, transformCsvData, validateCsvData],
    );

    const startUploadingData = useCallback(
        (fund: Partial<Fund>, groupData: Array<RowDataProp>, onChunk: (data: Array<RowDataProp>) => void) => {
            return new Promise((resolve) => {
                const submitData = chunk(groupData, dataChunkSize);
                const chunksCount = submitData.length;
                let currentChunkNth = 0;
                let uploadBatchId = undefined;

                const uploadChunk = async (data: Array<RowDataProp>) => {
                    setChanged(true);

                    payoutTransactionService
                        .storeBatch(organization.id, {
                            payouts: data,
                            fund_id: fund.id,
                            upload_batch_id: uploadBatchId,
                            file: {
                                name: csvFile.name,
                                content: await fileToText(csvFile),
                                total: groupData.length,
                                chunk: currentChunkNth,
                                chunks: chunksCount,
                                chunkSize: dataChunkSize,
                            },
                        })
                        .then((res) => {
                            uploadBatchId = res?.data?.data?.[0]?.upload_batch_id;
                            currentChunkNth++;
                            onChunk(data);

                            if (currentChunkNth == chunksCount) {
                                resolve(true);
                            } else if (currentChunkNth < chunksCount) {
                                uploadChunk(submitData[currentChunkNth]);
                            }
                        })
                        .catch((res: ResponseError) => {
                            if (res.status == 422 && res.data.errors) {
                                return pushDanger(
                                    'Het is niet gelukt om het gekozen bestand te verwerken.',
                                    Object.values(res.data.errors).reduce((msg, arr) => msg + arr.join(''), ''),
                                );
                            }

                            setLoading(false);
                            setHideModal(false);
                            setCsvProgress(1);
                            pushDanger(
                                'Er is een onbekende fout opgetreden tijdens het uploaden van CSV.',
                                'Controleer de CSV op problemen, vernieuw de pagina en probeer het opnieuw.',
                                { timeout: 30000 },
                            );
                        });
                };

                if (abortRef.current) {
                    return (abortRef.current = false);
                }

                uploadChunk(submitData[currentChunkNth]).then();
            });
        },
        [dataChunkSize, payoutTransactionService, organization.id, csvFile, pushDanger],
    );

    const startValidationUploadingData = useCallback(
        (fund: Partial<Fund>, groupData: Array<RowDataProp>, onChunk: (list: Array<RowDataProp>) => void) => {
            return new Promise((resolve, reject) => {
                const submitData = chunk(groupData, dataChunkSize);
                const chunksCount = submitData.length;
                const errors = {};

                let currentChunkNth = 0;

                const resolveIfFinished = () => {
                    if (currentChunkNth == chunksCount) {
                        if (Object.keys(errors).length) {
                            return reject(errors);
                        }

                        resolve(true);
                    } else if (currentChunkNth < chunksCount) {
                        uploadChunk(submitData[currentChunkNth]);
                    }
                };

                const uploadChunk = (data: Array<RowDataProp>) => {
                    payoutTransactionService
                        .storeBatchValidate(organization.id, { fund_id: fund.id, payouts: data })
                        .then(() => {
                            currentChunkNth++;
                            onChunk(data);
                            resolveIfFinished();
                        })
                        .catch((err: ResponseError) => {
                            if (err.status == 422 && err.data.errors) {
                                Object.keys(err.data.errors).forEach(function (key) {
                                    const keyData = key.split('.');
                                    keyData[1] = (
                                        parseInt(keyData[1], 10) +
                                        currentChunkNth * dataChunkSize
                                    ).toString();
                                    errors[keyData.join('.')] = err.data.errors[key];
                                });
                            } else {
                                alert('Onbekende error.');
                            }

                            currentChunkNth++;
                            onChunk(data);

                            resolveIfFinished();
                        });
                };

                uploadChunk(submitData[currentChunkNth]);
            });
        },
        [dataChunkSize, organization.id, payoutTransactionService],
    );

    const startUploading = useCallback(
        async (items: Array<RowDataProp>, validation = false) => {
            setCsvProgress(2);

            const totalRows = items.length;
            let uploadedRows = 0;

            setLoadingBarProgress(0, getStatus(fund, validation));

            if (validation) {
                return await startValidationUploadingData(fund, items, (list) => {
                    uploadedRows += list.length;
                    setLoadingBarProgress((uploadedRows / totalRows) * 100, getStatus(fund, true));
                })
                    .then(() => {
                        setLoadingBarProgress(100, getStatus(fund, true));
                        return true;
                    })
                    .catch((err: ResponseError) => {
                        setCsvProgress(1);
                        showInvalidRows(err, items);
                        return false;
                    });
            }

            const res = await startUploadingData(fund, items, (chunkData) => {
                uploadedRows += chunkData.length;
                setLoadingBarProgress((uploadedRows / totalRows) * 100, getStatus(fund, false));

                if (uploadedRows === totalRows) {
                    window.setTimeout(() => {
                        setLoadingBarProgress(100, getStatus(fund, false));
                    }, 0);
                }
            })
                .then(() => true)
                .catch(() => false);

            setCsvProgress(3);

            return res;
        },
        [fund, getStatus, setLoadingBarProgress, showInvalidRows, startUploadingData, startValidationUploadingData],
    );

    const uploadToServer = useCallback(async () => {
        if (!csvIsValid) {
            return false;
        }

        setLoading(true);

        if (data.length > 0) {
            if (await startUploading(data, true)) {
                await startUploading(data, false);
            }
        } else {
            pushDanger('CSV upload is geannuleerd', 'Er zijn geen gegevens geselecteerd.');
        }

        setLoadingBarProgress(0);
        setHideModal(false);
        setLoading(false);
    }, [csvIsValid, data, pushDanger, setLoadingBarProgress, startUploading]);

    const onDragEvent = useCallback((e: React.DragEvent, isDragOver: boolean) => {
        e?.preventDefault();
        e?.stopPropagation();

        setIsDragOver(isDragOver);
    }, []);

    return (
        <div
            className={classNames(
                'modal',
                step == STEP_SET_UP ? 'modal-md' : 'modal-bulk-upload',
                'modal-animated',
                (modal.loading || hideModal) && 'modal-loading',
                isDragOver && 'is-dragover',
                className,
            )}
            key={`step_${step}`}
            data-dusk="modalVoucherUpload">
            <div className="modal-backdrop" onClick={closeModal} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                <div className="modal-header">Upload CSV-bestand</div>
                <div
                    className={classNames(
                        'modal-body',
                        classNames(step === STEP_SET_UP ? 'modal-body-visible' : ''),
                        'form',
                    )}>
                    {step == STEP_SET_UP && (
                        <div className="modal-section form">
                            <div className="form-group">
                                <div className="form-label">{translate('modals.modal_voucher_create.labels.fund')}</div>

                                <FormGroupInfo
                                    info={'Selecteer het fonds waaruit de uitbetalingen moeten plaatsvinden.'}>
                                    <SelectControl
                                        className="flex-grow"
                                        value={fund.id}
                                        propKey={'id'}
                                        onChange={(fund_id: number) => {
                                            setFund(funds.find((fund) => fund.id === fund_id));
                                        }}
                                        options={funds}
                                        allowSearch={false}
                                        optionsComponent={SelectControlOptionsFund}
                                    />
                                </FormGroupInfo>
                            </div>
                        </div>
                    )}

                    {step == STEP_UPLOAD && (
                        <div
                            className="block block-csv"
                            onDragOver={(e) => onDragEvent(e, true)}
                            onDragEnter={(e) => onDragEvent(e, true)}
                            onDragLeave={(e) => onDragEvent(e, false)}
                            onDragEnd={(e) => onDragEvent(e, false)}
                            onDrop={(e) => {
                                onDragEvent(e, false);
                                uploadFile(filterSelectedFiles(e.dataTransfer.files)?.[0]).then();
                            }}>
                            <div className="csv-inner">
                                <input
                                    hidden={true}
                                    ref={inputRef}
                                    type="file"
                                    data-dusk={'inputUpload'}
                                    accept={(acceptedFiles || []).join(',')}
                                    onChange={(e) => {
                                        uploadFile(filterSelectedFiles(e.target.files)?.[0]).then();
                                        e.target.value = null;
                                    }}
                                />

                                {csvProgress <= 1 && (
                                    <div className="csv-upload-btn" onClick={() => inputRef.current.click()}>
                                        <div className="csv-upload-icon">
                                            <div className="mdi mdi-upload" />
                                        </div>
                                        <div className="csv-upload-text">
                                            {translate('csv_upload.labels.upload')}
                                            <br />
                                            <span>{translate('csv_upload.labels.swipe')}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="button-group flex-center">
                                    {csvProgress <= 1 && (
                                        <button className="button button-default" onClick={downloadExampleCsv}>
                                            <em className="mdi mdi-file-table-outline icon-start"> </em>
                                            <span>{translate('vouchers.buttons.download_csv')}</span>
                                        </button>
                                    )}
                                    {csvProgress <= 1 && (
                                        <button
                                            className="button button-primary"
                                            onClick={() => inputRef.current.click()}
                                            data-dusk="selectFileButton">
                                            <em className="mdi mdi-upload icon-start" />
                                            <span>{translate('vouchers.buttons.upload_csv')}</span>
                                        </button>
                                    )}
                                </div>

                                {csvProgress >= 2 && (
                                    <div className={`csv-upload-progress ${csvProgress == 3 ? 'done' : ''}`}>
                                        <div className="csv-upload-icon">
                                            {csvProgress == 2 && <div className="mdi mdi-loading" />}
                                            {csvProgress == 3 && (
                                                <div className="mdi mdi-check" data-dusk="successUploadIcon" />
                                            )}
                                        </div>
                                        <CSVProgressBar progressBar={progressBar} status={progressStatus} />
                                    </div>
                                )}

                                {csvFile && csvProgress < 2 && (
                                    <div className="csv-upload-actions">
                                        <div className={classNames(`block block-file`, !csvIsValid && 'has-error')}>
                                            <div className="block-file-details">
                                                <div className="file-icon">
                                                    {csvIsValid ? (
                                                        <div className="mdi mdi-file-outline" />
                                                    ) : (
                                                        <div className="mdi mdi-close-circle" />
                                                    )}
                                                </div>
                                                <div className="file-details">
                                                    <div className="file-name">{csvFile.name}</div>
                                                    <div className="file-size">{fileSize(csvFile.size)}</div>
                                                </div>
                                                <div
                                                    className="file-remove mdi mdi-close"
                                                    onClick={() => reset(false)}
                                                />
                                            </div>
                                        </div>

                                        {!csvIsValid && (
                                            <Fragment>
                                                {csvErrors.csvHasBsnWhileNotAllowed && (
                                                    <div className="form-error">
                                                        BSN field is present while BSN is not enabled for the
                                                        organization
                                                    </div>
                                                )}
                                                {csvErrors.csvAmountMissing && (
                                                    <div className="form-error">
                                                        De kolom `amount` mist in het bulkbestand.
                                                    </div>
                                                )}
                                                {csvErrors.invalidAmountField && (
                                                    <div className="form-error">
                                                        Het totaal aantal budget van het gewenste aantal tegoeden
                                                        overschrijd het gestorte bedrag op het fonds.
                                                    </div>
                                                )}
                                                {csvErrors.invalidPerVoucherAmount && (
                                                    <div className="form-error">
                                                        Één of meer tegoeden gaan over het maximale bedrag per tegoed.
                                                        (limiet is: {fund.limit_per_voucher_locale}).
                                                    </div>
                                                )}
                                                {csvErrors.hasInvalidFundIds && (
                                                    <div className="form-error">
                                                        De kolom `fund_id` in het bulkbestand bevat verkeerde fonds
                                                        identificatienummers
                                                        {` '${csvErrors.hasInvalidFundIdsList}'`}. Deze nummers horen
                                                        niet bij de door u geselecteerde organisatie.
                                                    </div>
                                                )}
                                            </Fragment>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer text-center">
                    {csvProgress < 2 && (
                        <button
                            className="button button-default"
                            onClick={closeModal}
                            id="close"
                            data-dusk="closeModalButton">
                            Annuleren
                        </button>
                    )}

                    <div className="flex-grow" />

                    <div className="button-group">
                        <button
                            className={`button button-default`}
                            disabled={step == STEP_SET_UP || loading}
                            onClick={() => setStep(STEP_SET_UP)}>
                            Terug
                        </button>

                        {step == STEP_SET_UP && (
                            <button
                                className="button button-primary"
                                onClick={() => setStep(STEP_UPLOAD)}
                                data-dusk={'modalFundSelectSubmit'}>
                                Bevestigen
                            </button>
                        )}

                        {step == STEP_UPLOAD && (
                            <Fragment>
                                {csvProgress < 3 ? (
                                    <button
                                        className="button button-primary"
                                        onClick={uploadToServer}
                                        disabled={csvProgress != 1 || loading || !csvIsValid}
                                        data-dusk="uploadFileButton">
                                        Bevestigen
                                    </button>
                                ) : (
                                    <button
                                        type={'button'}
                                        className="button button-primary"
                                        disabled={loading}
                                        onClick={closeModal}
                                        data-dusk="closeModalButton">
                                        Sluiten
                                    </button>
                                )}
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
