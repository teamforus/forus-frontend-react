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
import usePushInfo from '../../hooks/usePushInfo';
import { fileToText } from '../../helpers/utils';
import { useFundService } from '../../services/FundService';
import RecordType from '../../props/models/RecordType';
import { usePrevalidationService } from '../../services/PrevalidationService';
import usePushApiError from '../../hooks/usePushApiError';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import TranslateHtml from '../elements/translate-html/TranslateHtml';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';

type CSVErrorProp = {
    emptyHeader?: string | string[];
    emptyBody?: string | string[];
    invalidRecordTypes?: string | string[];
    missingRecordTypes?: string | string[];
    invalidRows?: string | string[];
};

type CSVWarningProp = {
    optionalRecordTypes?: string | string[];
};

type RowDataPropData = { [key: string]: string };

type RowDataProp = {
    _uid: string;
    uid_hash: string;
    records_hash: string;
    data: RowDataPropData;
};

export default function ModalPrevalidationsUpload({
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
    const pushInfo = usePushInfo();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const fileService = useFileService();
    const fundService = useFundService();
    const prevalidationService = usePrevalidationService();

    const [STEP_SET_UP] = useState(1);
    const [STEP_UPLOAD] = useState(2);

    const [fund, setFund] = useState<Fund>(funds?.find((fund) => fund.id == fundId) || funds[0]);
    const [step, setStep] = useState(STEP_SET_UP);
    const [data, setData] = useState<Array<RowDataProp>>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [changed, setChanged] = useState<boolean>(false);
    const [csvFile, setCsvFile] = useState<File>(null);
    const [hideModal, setHideModal] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dataChunkSize] = useState<number>(50);
    const [progressBar, setProgressBar] = useState<number>(null);
    const [csvComparing, setCsvComparing] = useState(false);

    const [csvErrors, setCsvErrors] = useState<CSVErrorProp>({});
    const [csvWarnings, setCsvWarnings] = useState<CSVWarningProp>({});
    const [csvIsValid, setCsvIsValid] = useState(false);
    const [csvProgress, setCsvProgress] = useState<number>(0);

    const [progressStatus, setProgressStatus] = useState<string>('');
    const [acceptedFiles] = useState(['.csv']);

    const abortRef = useRef<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const criteriaRecordTypeKeys = useMemo(() => {
        return recordTypes?.filter((recordType) => recordType.criteria)?.map((recordType) => recordType.key);
    }, [recordTypes]);

    const fundRecordKey = useMemo(() => {
        return fund.csv_required_keys.filter((key) => key.endsWith('_eligible'))?.[0];
    }, [fund.csv_required_keys]);

    const fundRecordKeyValue = useMemo(() => {
        return fund.criteria?.filter((criteria) => {
            return criteria.record_type_key == fundRecordKey && criteria.operator == '=';
        })[0]?.value;
    }, [fund.criteria, fundRecordKey]);

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
        fileService.downloadFile((fund.key || 'fund') + '_sample.csv', fundService.sampleCSV(fund));
    }, [fileService, fund, fundService]);

    const reset = useCallback((abortRefValue = true) => {
        abortRef.current = abortRefValue;

        setCsvFile(null);
        setCsvErrors({});
        setCsvIsValid(false);
        setCsvProgress(null);
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
        function (data: Array<RowDataProp>): Array<string> {
            return data
                .map((row, row_key) => {
                    const rowRecordKeys = Object.keys(row);

                    const missingRecordTypes = fund.csv_required_keys.filter((recordTypeKey) => {
                        return rowRecordKeys.indexOf(recordTypeKey) == -1;
                    });

                    if (missingRecordTypes.length > 0) {
                        return [
                            `Lijn ${row_key + 1}:`,
                            `heet ontbrekende verplichte persoonsgegevens: "${missingRecordTypes.join('", "')}"`,
                        ].join(' ');
                    }

                    return null;
                })
                .filter((error) => error !== null);
        },
        [fund?.csv_required_keys],
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
        [fund.csv_primary_key, openModal, pushDanger, reset],
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

            if (header.length == 0) {
                setCsvErrors({ emptyHeader: 'Het .csv bestand is leeg, controleer het bestand' });
                setCsvIsValid(false);
                return;
            }

            if (body.length == 0) {
                setCsvErrors({
                    emptyBody: 'Het .csv bestand heeft kolomnamen maar geen inhoud, controleer de inhoud.',
                });
                setCsvIsValid(false);
                return;
            }

            // append eligibility key
            if (fund && fundRecordKey && fundRecordKeyValue && header.indexOf(fundRecordKey) === -1) {
                header.unshift(fundRecordKey);
                body.forEach((row) => row.unshift(fundRecordKeyValue));
            }

            const invalidRecordTypes = header.filter((recordTypeKey) => {
                return criteriaRecordTypeKeys.indexOf(recordTypeKey) == -1;
            });

            const missingRecordTypes = fund.csv_required_keys.filter((recordTypeKey: string) => {
                return header.indexOf(recordTypeKey) == -1;
            });

            const optionalRecordTypes = header.filter((recordTypeKey) => {
                return fund.csv_required_keys.indexOf(recordTypeKey) == -1;
            });

            const csvErrors: CSVErrorProp = {};
            const csvWarnings: CSVWarningProp = {};

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
            }, []) as RowDataProp[];

            const invalidRows = validateCsvData(parsedData);

            if (invalidRows.length > 0) {
                csvErrors.invalidRows = ['Volgende problemen zijn opgetreden bij dit .csv bestand:', ...invalidRows];
            }

            setCsvFile(file);

            setCsvErrors(csvErrors);
            setCsvWarnings(csvWarnings);

            setData(parsedData);
            setCsvIsValid(Object.keys(csvErrors).length === 0);
            setCsvProgress(1);
        },
        [criteriaRecordTypeKeys, fund, fundRecordKey, fundRecordKeyValue, parseCsvFile, reset, validateCsvData],
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

    const startUploadingToServer = useCallback(
        (data: Array<RowDataPropData>, overwriteUids: Array<string> = []) => {
            return new Promise((resolve, reject) => {
                setCsvProgress(2);

                const submitData = chunkList(JSON.parse(JSON.stringify(data)), dataChunkSize);
                const chunksCount = submitData.length;

                let currentChunkNth = 0;

                updateProgressBarValue(0);

                const uploadChunk = async function (data: Array<{ [key: string]: string }>) {
                    prevalidationService
                        .storeBatch(fund.organization_id, data, fund.id, overwriteUids, {
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
                                    setCsvProgress(3);
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
        },
        [
            chunkList,
            dataChunkSize,
            fund.id,
            fund.organization_id,
            onCompleted,
            prevalidationService,
            pushDanger,
            showInvalidRows,
            updateProgressBarValue,
            csvFile,
            pushApiError,
        ],
    );

    const compareCsvAndDb = useCallback(
        (csvRecords: Array<RowDataProp>, dbRecords: Array<{ uid_hash: string; records_hash: string }>) => {
            const dbPrimaryKeys = dbRecords.reduce((obj, row) => {
                return { ...obj, [row.uid_hash]: true };
            }, {});

            const dbPrimaryFullKeys = dbRecords.reduce((obj, row) => {
                return { ...obj, [row.uid_hash + '_' + row.records_hash]: true };
            }, {});

            const newRecords: Array<RowDataPropData> = [];
            const updatedRecords: Array<RowDataPropData> = [];

            for (let index = 0; index < csvRecords.length; index++) {
                if (dbPrimaryKeys[csvRecords[index].uid_hash]) {
                    if (!dbPrimaryFullKeys[csvRecords[index].uid_hash + '_' + csvRecords[index].records_hash]) {
                        updatedRecords.push({ ...csvRecords[index].data });
                    }
                } else {
                    newRecords.push(csvRecords[index].data);
                }
            }

            if (updatedRecords.length === 0) {
                if (newRecords.length > 0) {
                    pushSuccess(
                        'Uploaden!',
                        'Geen dubbele waarden gevonden, uploaden ' + newRecords.length + ' nieuwe gegeven(s)...',
                    );

                    startUploadingToServer(newRecords).then();
                } else {
                    pushSuccess('Niks veranderd!', 'Geen nieuwe gegevens gevonden in uw .csv bestand...');

                    setCsvProgress(3);
                    updateProgressBarValue(100);
                }
            } else {
                const items = updatedRecords.map((row) => ({
                    _uid: row._uid,
                    label: row[fund.csv_primary_key],
                    value: row[fund.csv_primary_key],
                }));

                setHideModal(true);

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={'Dubbele gegevens gedetecteerd.'}
                        hero_subtitle={[
                            `Weet u zeker dat u voor ${items.length} rijen gegevens wilt aanpassen?`,
                            'Deze nummers hebben al een activatiecode.',
                        ].join(' ')}
                        enableToggles={true}
                        label_on={'Aanpassen'}
                        label_off={'Overslaan'}
                        button_none={'Alles overslaan'}
                        button_all={'Pas alles aan'}
                        items={items}
                        onConfirm={({ list }) => {
                            const skipUids = list.filter((item) => !item.model).map((item) => item._uid);
                            const updateUids = list.filter((item) => item.model).map((item) => item._uid);

                            const updatePrimaryKeys = updatedRecords
                                .filter((row) => updateUids.includes(row._uid))
                                .map((row) => row[fund.csv_primary_key]);

                            const newAndUpdatedRecords = updatedRecords
                                .filter((csvRow) => !skipUids.includes(csvRow._uid))
                                .concat(newRecords);

                            pushSuccess(
                                'Uploading!',
                                [
                                    `${updatedRecords.length - skipUids.length} gegeven(s) worden vervangen en`,
                                    `${newRecords.length} gegeven(s) worden aangemaakt!`,
                                ].join(' '),
                            );

                            setHideModal(false);

                            if (newAndUpdatedRecords.length > 0) {
                                return startUploadingToServer(newAndUpdatedRecords, updatePrimaryKeys).then(() => {
                                    if (skipUids.length > 0) {
                                        pushSuccess('Klaar!', `${skipUids.length} gegeven(s) overgeslagen!`);
                                    }

                                    pushSuccess(
                                        'Klaar!',
                                        `${updatedRecords.length - skipUids.length} gegevens vervangen!`,
                                    );

                                    pushSuccess('Klaar!', `${newRecords.length} nieuwe gegeven(s) aangemaakt!`);
                                }, console.error);
                            }

                            onCompleted?.();
                            setCsvProgress(3);
                            updateProgressBarValue(100);
                            pushSuccess('Klaar!', skipUids.length + ' gegevens overgeslagen, geen nieuwe aangemaakt!');
                        }}
                        onCancel={() => {
                            setHideModal(false);
                            onCompleted?.();
                        }}
                    />
                ));
            }
        },
        [fund.csv_primary_key, onCompleted, openModal, pushSuccess, startUploadingToServer, updateProgressBarValue],
    );

    const submitCollectionCheck = useCallback(() => {
        setCsvProgress(2);
        abortRef.current = false;

        const submitData = chunkList(JSON.parse(JSON.stringify(data)), dataChunkSize);
        const chunksCount = submitData.length;

        let currentChunkNth = 0;

        updateProgressBarValue(0);
        let collection = [];
        let collectionDb = [];

        const uploadChunk = function (data: Array<string>) {
            prevalidationService
                .submitCollectionCheck(fund.organization_id, data, fund.id, [])
                .then((res) => {
                    currentChunkNth++;
                    updateProgressBarValue((currentChunkNth / chunksCount) * 100);
                    collection = [...collection, ...res.data.collection];
                    collectionDb = [...collectionDb, ...res.data.db];

                    if (currentChunkNth == chunksCount) {
                        setTimeout(() => {
                            setLoading(false);

                            pushSuccess('Vergelijken...', 'Gegevens ingeladen! Vergelijken met .csv...', {
                                icon: 'timer-sand',
                            });

                            compareCsvAndDb(
                                collection.map((row) => ({ _uid: uniqueId('rand_'), ...row })),
                                collectionDb.map((row) => ({ _uid: uniqueId('rand_'), ...row })),
                            );
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
                });
        };

        setLoading(true);
        uploadChunk(submitData[currentChunkNth]);
    }, [
        chunkList,
        compareCsvAndDb,
        data,
        dataChunkSize,
        fund?.id,
        fund?.organization_id,
        prevalidationService,
        pushDanger,
        pushSuccess,
        showInvalidRows,
        updateProgressBarValue,
        pushApiError,
    ]);

    const onConfirmUpload = useCallback(() => {
        setCsvComparing(true);

        pushSuccess('Inladen...', 'Inladen van gegevens voor controle op dubbele waarden!', {
            icon: 'download-outline',
        });

        submitCollectionCheck();
    }, [pushSuccess, submitCollectionCheck]);

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
            data-dusk="modalPrevalidationUpload">
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
                                        onClick={onConfirmUpload}
                                        disabled={csvProgress != 1 || loading || !csvIsValid || csvComparing}
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
