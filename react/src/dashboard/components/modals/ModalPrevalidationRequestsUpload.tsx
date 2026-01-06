import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import Fund from '../../props/models/Fund';
import { useFileService } from '../../services/FileService';
import { fileSize } from '../../helpers/string';
import Papa from 'papaparse';
import { uniqueId, isEmpty } from 'lodash';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import { ResponseError } from '../../props/ApiResponses';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useOpenModal from '../../hooks/useOpenModal';
import CSVProgressBar from '../elements/csv-progress-bar/CSVProgressBar';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import { fileToText } from '../../helpers/utils';
import { useFundService } from '../../services/FundService';
import usePushApiError from '../../hooks/usePushApiError';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import TranslateHtml from '../elements/translate-html/TranslateHtml';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import { usePrevalidationRequestService } from '../../services/PrevalidationRequestService';
import { ProfileRecordType } from '../../props/models/Sponsor/SponsorIdentity';
import RecordType from '../../props/models/RecordType';

type CSVErrorProp = {
    emptyHeader?: string | string[];
    emptyBody?: string | string[];
    invalidRecordTypes?: string | string[];
    missingRecordTypes?: string | string[];
    missingBsn?: string | string[];
    invalidRows?: string | string[];
};

type CSVWarningProp = {
    optionalRecordTypes?: string | string[];
};

type RowDataPropData = { [key: string]: string };

enum Steps {
    select_fund,
    upload_csv,
}

enum CSVProgress {
    initial,
    validated,
    uploading,
    uploaded,
}

export default function ModalPrevalidationRequestsUpload({
    funds,
    fundId,
    modal,
    className,
    recordTypes,
    onCompleted,
}: {
    funds: Array<Fund>;
    fundId: number;
    modal: ModalState;
    className?: string;
    recordTypes?: Array<RecordType>;
    onCompleted: () => void;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const fileService = useFileService();
    const fundService = useFundService();
    const prevalidationRequestService = usePrevalidationRequestService();

    const [fund, setFund] = useState<Fund>(funds?.find((fund) => fund.id == fundId) || funds[0]);
    const [step, setStep] = useState<Steps>(Steps.select_fund);
    const [data, setData] = useState<Array<RowDataPropData>>(null);
    const [changed, setChanged] = useState<boolean>(false);
    const [csvFile, setCsvFile] = useState<File>(null);
    const [hideModal, setHideModal] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dataChunkSize] = useState<number>(50);
    const [progressBar, setProgressBar] = useState<number>(null);

    const [csvErrors, setCsvErrors] = useState<CSVErrorProp>({});
    const [csvWarnings, setCsvWarnings] = useState<CSVWarningProp>({});
    const [csvIsValid, setCsvIsValid] = useState(false);
    const [csvProgress, setCsvProgress] = useState<CSVProgress>(CSVProgress.initial);

    const [progressStatus, setProgressStatus] = useState<string>('');
    const [acceptedFiles] = useState(['.csv']);

    const abortRef = useRef<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const criteriaRecordTypeKeys = useMemo(() => {
        return recordTypes?.filter((recordType) => recordType.criteria)?.map((recordType) => recordType.key);
    }, [recordTypes]);

    const fundRecordKey = useMemo(() => {
        return fund.csv_required_keys_except_prefill.filter((key) => key.endsWith('_eligible'))?.[0];
    }, [fund.csv_required_keys_except_prefill]);

    const fundRecordKeyValue = useMemo(() => {
        return fund.criteria?.filter((criteria) => {
            return criteria.record_type_key == fundRecordKey && criteria.operator == '=';
        })[0]?.value;
    }, [fund.criteria, fundRecordKey]);

    const closeModal = useCallback(() => {
        if (changed) {
            onCompleted();
        }

        modal.close();
    }, [changed, modal, onCompleted]);

    const downloadExampleCsv = useCallback(() => {
        fileService.downloadFile(
            (fund.key || 'fund') + '_sample.csv',
            fundService.sampleCSVForPrevalidationRequest(fund),
        );
    }, [fileService, fund, fundService]);

    const reset = useCallback((abortRefValue = true) => {
        abortRef.current = abortRefValue;

        setHideModal(false);
        setCsvFile(null);
        setCsvErrors({});
        setCsvIsValid(false);
        setCsvProgress(CSVProgress.initial);
    }, []);

    const filterSelectedFiles = useCallback(
        (files: FileList) => {
            return [...files].filter((file) => {
                return acceptedFiles.includes('.' + file.name.split('.')[file.name.split('.').length - 1]);
            });
        },
        [acceptedFiles],
    );

    const showInvalidRows = useCallback(
        (errors = {}, rows = [], rowIndex = 0) => {
            const items = Object.keys(errors)
                .map(function (key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const fieldKey = keyData[2];
                    const index = parseInt(keyDataId, 10) + 1 + rowIndex;

                    return [index, errors[key], fieldKey];
                })
                .sort((a, b) => a[0] - b[0]);

            const uniqueRows = items.reduce((arr, item) => {
                return arr.includes(item[0]) ? arr : [...arr, item[0]];
            }, []);

            const message = [
                `${uniqueRows.length} van ${rows.length}`,
                `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                `bekijk het bestand bij welke rij(en) het mis gaat.`,
            ].join(' ');

            pushDanger('Waarschuwing', message);

            setHideModal(true);

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Er zijn fouten opgetreden bij het importeren van de aanvragers'}
                    hero_subtitle={message}
                    enableToggles={false}
                    label_on={'Aanmaken'}
                    label_off={'Overslaan'}
                    items={items.map((item) => ({
                        value: `Rij: ${item[0]}: ${item[2]} - ${item[1]}`,
                        _uid: uniqueId('rand_'),
                        label: item?.[fund.csv_primary_key],
                    }))}
                    onConfirm={() => {
                        reset();
                    }}
                    onCancel={() => {
                        reset();
                    }}
                />
            ));
        },
        [fund?.csv_primary_key, openModal, pushDanger, reset],
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

            results.data = results.data.filter((item) => !!item);

            const data = (results.data = results.data.filter((item) => !!item));
            const header = data.length > 0 ? data[0] : [];

            const body = (data.length > 0 ? data.slice(1) : []).filter((row) => {
                return Array.isArray(row) && row.filter((item) => !!item).length > 0;
            });

            const csvErrors: CSVErrorProp = {};
            const csvWarnings: CSVWarningProp = {};

            if (header.length == 0) {
                csvErrors.emptyHeader = 'Het .csv bestand is leeg, controleer het bestand';
            }

            if (header.filter((item) => item === 'bsn').length == 0) {
                csvErrors.missingBsn = 'In het .csv bestand ontbreken persoonsgegevens: BSN';
            }

            if (body.length == 0) {
                csvErrors.emptyBody = 'Het .csv bestand heeft kolomnamen maar geen inhoud, controleer de inhoud.';
            }

            // append eligibility key
            if (fund && fundRecordKey && fundRecordKeyValue && header.indexOf(fundRecordKey) === -1) {
                header.unshift(fundRecordKey);
                body.forEach((row) => row.unshift(fundRecordKeyValue));
            }

            const invalidRecordTypes = header.filter((recordTypeKey: ProfileRecordType & 'bsn') => {
                return recordTypeKey !== 'bsn' && criteriaRecordTypeKeys.indexOf(recordTypeKey) == -1;
            });

            const missingRecordTypes = fund.csv_required_keys_except_prefill.filter((recordTypeKey: string) => {
                return header.indexOf(recordTypeKey) == -1;
            });

            const optionalRecordTypes = header.filter((recordTypeKey) => {
                return (
                    recordTypeKey !== 'bsn' &&
                    fund.csv_required_keys_except_prefill.indexOf(recordTypeKey) == -1 &&
                    fund.csv_required_keys_by_groups.indexOf(recordTypeKey) == -1
                );
            });

            if (invalidRecordTypes.length > 0) {
                csvErrors.invalidRecordTypes = `Het .csv bestand heeft de volgende ongeldige persoonsgegevens: '${invalidRecordTypes.join(
                    "', '",
                )}'`;
            }

            if (missingRecordTypes.length > 0) {
                csvErrors.missingRecordTypes = `In het .csv bestand ontbreken persoonsgegevens die verplicht zijn voor dit fonds '${
                    fund.name
                }': '${missingRecordTypes.join("', '")}'`;
            }

            if (optionalRecordTypes.length > 0) {
                csvWarnings.optionalRecordTypes = [
                    `In het .csv bestand zijn persoonsgegevens toegevoegd die optioneel zijn voor "${fund.name}" fonds. `,
                    'Controleer of deze persoonsgegevens echt nodig zijn voor de toekenning. ',
                    `De volgende persoonsgegevens zijn optioneel: "${optionalRecordTypes.join("', '")}".`,
                ];
            }

            const parsedData = body.reduce(function (result, val) {
                const row = {};

                header.forEach((hVal, hKey) => {
                    if (val[hKey] && val[hKey] != '') {
                        row[hVal] = val[hKey];
                    }
                });

                return isEmpty(row) ? result : [...result, row];
            }, []) as RowDataPropData[];

            setCsvFile(file);

            setCsvErrors(csvErrors);
            setCsvWarnings(csvWarnings);

            setData(parsedData);
            setCsvIsValid(Object.keys(csvErrors).length === 0);
            setCsvProgress(CSVProgress.validated);
        },
        [criteriaRecordTypeKeys, fund, fundRecordKey, fundRecordKeyValue, parseCsvFile, reset],
    );

    const updateProgressBarValue = useCallback((progress: number) => {
        setProgressBar(progress);
        setProgressStatus(progress < 100 ? 'Aan het uploaden...' : 'Klaar!');
    }, []);

    const chunkList = useCallback((arr: Array<number>, len: number) => {
        const chunks = [];
        const n = arr.length;

        let i = 0;

        while (i < n) {
            chunks.push(arr.slice(i, (i += len)));
        }

        return chunks;
    }, []);

    const startUploadingToServer = useCallback(() => {
        return new Promise((resolve, reject) => {
            setCsvProgress(CSVProgress.uploading);

            const submitData = chunkList(JSON.parse(JSON.stringify(data)), dataChunkSize);
            const chunksCount = submitData.length;

            let currentChunkNth = 0;

            updateProgressBarValue(0);

            const uploadChunk = async function (data: Array<{ [key: string]: string }>) {
                prevalidationRequestService
                    .storeBatch(fund.organization_id, data, fund.id, {
                        name: csvFile.name,
                        content: await fileToText(csvFile),
                        total: data.length,
                        chunk: currentChunkNth,
                        chunks: chunksCount,
                        chunkSize: dataChunkSize,
                    })
                    .then(() => {
                        setChanged(true);

                        currentChunkNth++;
                        updateProgressBarValue((currentChunkNth / chunksCount) * 100);

                        if (currentChunkNth == chunksCount) {
                            setTimeout(() => {
                                setProgressBar(100);
                                setCsvProgress(CSVProgress.uploaded);
                                onCompleted?.();
                                resolve(null);
                            }, 0);
                        } else {
                            if (abortRef.current) {
                                return (abortRef.current = false);
                            }

                            uploadChunk(submitData[currentChunkNth]);
                        }
                    })
                    .catch((err: ResponseError) => {
                        if (err.status == 422 && err.data.errors) {
                            showInvalidRows(err.data.errors, data, currentChunkNth * 100);

                            return err.data?.errors?.data
                                ? pushDanger(err.data.errors.data[0])
                                : pushDanger('Onbekende error.');
                        }

                        pushApiError(err, 'Onbekende error.');
                        reject();
                    });
            };

            uploadChunk(submitData[currentChunkNth]).then();
        });
    }, [
        chunkList,
        data,
        dataChunkSize,
        updateProgressBarValue,
        prevalidationRequestService,
        fund.organization_id,
        fund.id,
        csvFile,
        onCompleted,
        pushApiError,
        showInvalidRows,
        pushDanger,
    ]);

    const onConfirmUpload = useCallback(() => {
        pushSuccess('Inladen...', 'Inladen van gegevens voor controle op dubbele waarden!', {
            icon: 'download-outline',
        });

        startUploadingToServer().then();
    }, [pushSuccess, startUploadingToServer]);

    const onDragEvent = useCallback((e: React.DragEvent, isDragOver: boolean) => {
        e?.preventDefault();
        e?.stopPropagation();

        setIsDragOver(isDragOver);
    }, []);

    return (
        <div
            className={classNames(
                'modal',
                step == Steps.select_fund ? 'modal-md' : 'modal-bulk-upload',
                'modal-animated',
                (modal.loading || hideModal) && 'modal-loading',
                isDragOver && 'is-dragover',
                className,
            )}
            key={`step_${step}`}
            data-dusk="modalPrevalidationRequestUpload">
            <div className="modal-backdrop" onClick={closeModal} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                <div className="modal-header">Upload CSV-bestand</div>
                <div className={classNames('modal-body', step === Steps.select_fund && 'modal-body-visible', 'form')}>
                    {step == Steps.select_fund && (
                        <div className="modal-section form">
                            <div className="form-group">
                                <div className="form-label">{translate('modals.modal_voucher_create.labels.fund')}</div>

                                <FormGroupInfo info={<TranslateHtml i18n={'csv_upload.tooltips.funds'} />}>
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

                    {step == Steps.upload_csv && (
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

                                {csvProgress <= CSVProgress.validated && (
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
                                    {csvProgress <= CSVProgress.validated && (
                                        <button className="button button-default" onClick={downloadExampleCsv}>
                                            <em className="mdi mdi-file-table-outline icon-start"> </em>
                                            <span>{translate('vouchers.buttons.download_csv')}</span>
                                        </button>
                                    )}
                                    {csvProgress <= CSVProgress.validated && (
                                        <button
                                            className="button button-primary"
                                            onClick={() => inputRef.current.click()}
                                            data-dusk="selectFileButton">
                                            <em className="mdi mdi-upload icon-start" />
                                            <span>{translate('vouchers.buttons.upload_csv')}</span>
                                        </button>
                                    )}
                                </div>

                                {csvProgress >= CSVProgress.uploading && (
                                    <div
                                        className={`csv-upload-progress ${csvProgress == CSVProgress.uploaded ? 'done' : ''}`}>
                                        <div className="csv-upload-icon">
                                            {csvProgress == CSVProgress.uploading && (
                                                <div className="mdi mdi-loading" />
                                            )}
                                            {csvProgress == CSVProgress.uploaded && (
                                                <div className="mdi mdi-check" data-dusk="successUploadIcon" />
                                            )}
                                        </div>
                                        <CSVProgressBar progressBar={progressBar} status={progressStatus} />
                                    </div>
                                )}

                                {csvFile && csvProgress < CSVProgress.uploading && (
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

                                        {Object.keys(csvErrors).length === 0 && Object.keys(csvWarnings).length > 0 && (
                                            <div className="csv-file-warning">
                                                {Object.keys(csvWarnings).map((key) => (
                                                    <div key={key}>{csvWarnings[key]}</div>
                                                ))}
                                            </div>
                                        )}

                                        {Object.keys(csvErrors).length > 0 && (
                                            <div className="csv-file-error">
                                                {Object.keys(csvErrors).map((key) => (
                                                    <div key={key}>{csvErrors[key]}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer text-center">
                    {csvProgress < CSVProgress.uploading && (
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
                        {/* Cancel button */}
                        <button
                            className={`button button-default`}
                            disabled={step == Steps.select_fund}
                            onClick={() => setStep(Steps.select_fund)}>
                            Terug
                        </button>

                        {/* Confirm selected fund button */}
                        {step == Steps.select_fund && (
                            <button
                                className="button button-primary"
                                onClick={() => setStep(Steps.upload_csv)}
                                data-dusk={'modalFundSelectSubmit'}>
                                Bevestigen
                            </button>
                        )}

                        {/* Upload selected CSV or cancel button */}
                        {step == Steps.upload_csv && (
                            <Fragment>
                                {csvProgress}
                                {csvProgress != CSVProgress.validated}
                                {csvIsValid}
                                {csvProgress < CSVProgress.uploaded ? (
                                    <button
                                        className="button button-primary"
                                        onClick={onConfirmUpload}
                                        disabled={csvProgress != CSVProgress.validated || !csvIsValid}
                                        data-dusk="uploadFileButton">
                                        Bevestigen
                                    </button>
                                ) : (
                                    <button
                                        type={'button'}
                                        className="button button-primary"
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
