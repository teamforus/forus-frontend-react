import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import { useFundService } from '../../../../services/FundService';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalCreatePrevalidation from '../../../modals/ModalCreatePrevalidation';
import { useFileService } from '../../../../services/FileService';
import CSVProgressBar from '../../../elements/csv-progress-bar/CSVProgressBar';
import RecordType from '../../../../props/models/RecordType';
import Papa from 'papaparse';
import { isEmpty, uniqueId } from 'lodash';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import { usePrevalidationService } from '../../../../services/PrevalidationService';
import ModalDuplicatesPicker from '../../../modals/ModalDuplicatesPicker';
import useTranslate from '../../../../hooks/useTranslate';
import usePushDanger from '../../../../hooks/usePushDanger';
import { ResponseError } from '../../../../props/ApiResponses';
import { fileSize } from '../../../../helpers/string';
import classNames from 'classnames';
import { fileToText } from '../../../../helpers/utils';
import usePushApiError from '../../../../hooks/usePushApiError';

type RowDataPropData = { [key: string]: string };

type RowDataProp = {
    _uid: string;
    uid_hash: string;
    records_hash: string;
    data: RowDataPropData;
};

export default function CSVUpload({
    fund,
    onUpdated = null,
    recordTypes = [],
}: {
    fund: Fund;
    onUpdated?: () => void;
    recordTypes: Array<RecordType>;
}) {
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const fileService = useFileService();
    const fundService = useFundService();
    const prevalidationService = usePrevalidationService();

    const [isDragOver, setIsDragOver] = useState(false);
    const [dataChunkSize] = useState<number>(100);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [acceptedFiles] = useState(['.csv']);

    const abort = useRef<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState(null);

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

    const [csvFile, setCsvFile] = useState<File>(null);
    const [csvErrors, setCsvErrors] = useState<string | string[]>(null);
    const [csvIsValid, setCsvIsValid] = useState(false);
    const [csvWarnings, setCsvWarnings] = useState<string | string[]>(null);
    const [csvProgress, setCsvProgress] = useState<number>(null);
    const [csvProgressBar, setCsvProgressBar] = useState<number>(null);
    const [csvComparing, setCsvComparing] = useState(false);

    const reset = useCallback(() => {
        abort.current = true;

        setCsvFile(null);
        setCsvErrors(null);
        setCsvIsValid(false);
        setCsvWarnings(null);
        setCsvProgress(null);
        setCsvProgressBar(null);
        setCsvComparing(false);
    }, []);

    const onDragEvent = useCallback((e: React.DragEvent, isDragOver: boolean) => {
        e?.preventDefault();
        e?.stopPropagation();

        setIsDragOver(isDragOver);
    }, []);

    const filterSelectedFiles = useCallback(
        (files: FileList) => {
            return [...files].filter((file) => {
                return acceptedFiles.filter((type) => file.name.endsWith(type));
            });
        },
        [acceptedFiles],
    );

    const updateProgressBarValue = useCallback((progress: number) => {
        setCsvProgressBar(progress);
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

    const validateFile = useCallback(
        function (data: Array<{ [key: string]: string }>): Array<string> {
            return data
                .map((row, row_key) => {
                    const rowRecordKeys = Object.keys(row);

                    const missingRecordTypes = fund.csv_required_keys.filter((recordTypeKey) => {
                        return rowRecordKeys.indexOf(recordTypeKey) == -1;
                    });

                    if (missingRecordTypes.length > 0) {
                        return `Lijn ${
                            row_key + 1
                        }: heet ontbrekende verplichte persoonsgegevens: "${missingRecordTypes.join('", "')}"`;
                    }

                    return null;
                })
                .filter((error) => error !== null);
        },
        [fund?.csv_required_keys],
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
        async (file: File) => {
            reset();

            if (!file) {
                return setCsvErrors('Kies eerst een .csv bestand.');
            }

            const results = await parseCsvFile(file);

            if (!results) {
                return;
            }

            const data = (results.data = results.data.filter((item) => !!item));
            const header = data.length > 0 ? data[0] : [];

            const body = (data.length > 0 ? data.slice(1) : []).filter((row) => {
                return Array.isArray(row) && row.filter((item) => !!item).length > 0;
            });

            setCsvFile(file);

            if (header.length == 0) {
                return setCsvErrors('Het .csv bestand is leeg, controleer het bestand.');
            }

            if (body.length == 0) {
                return setCsvErrors('Het .csv bestand heeft kolomnamen maar geen inhoud, controleer de inhoud.');
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

            if (invalidRecordTypes.length > 0) {
                return setCsvErrors(
                    `Het .csv bestand heeft de volgende ongeldige persoonsgegevens: '${invalidRecordTypes.join(
                        "', '",
                    )}'`,
                );
            }

            if (missingRecordTypes.length > 0) {
                return setCsvErrors(
                    `In het .csv bestand ontbreken persoonsgegevens die verplicht zijn voor dit fonds '${
                        fund.name
                    }': '${missingRecordTypes.join("', '")}'`,
                );
            }

            if (optionalRecordTypes.length > 0) {
                setCsvWarnings([
                    `In het .csv bestand zijn persoonsgegevens toegevoegd die optioneel zijn voor "${fund.name}" fonds. `,
                    'Controleer of deze persoonsgegevens echt nodig zijn voor de toekenning. ',
                    `De volgende persoonsgegevens zijn optioneel: "${optionalRecordTypes.join("', '")}".`,
                ]);
            }

            const parsedData = body.reduce(function (result, val) {
                const row = {};

                header.forEach((hVal, hKey) => {
                    if (val[hKey] && val[hKey] != '') {
                        row[hVal] = val[hKey];
                    }
                });

                return isEmpty(row) ? result : [...result, row];
            }, []);

            const invalidRows = validateFile(parsedData);

            if (invalidRows.length > 0) {
                return setCsvErrors(['Volgende problemen zijn opgetreden bij dit .csv bestand:', ...invalidRows]);
            }

            setData(parsedData);
            setCsvIsValid(true);
            setCsvProgress(1);
        },
        [parseCsvFile, fund, fundRecordKey, fundRecordKeyValue, validateFile, reset, criteriaRecordTypeKeys],
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
                    onConfirm={() => reset()}
                    onCancel={() => reset()}
                />
            ));
        },
        [fund.csv_primary_key, openModal, pushDanger, reset],
    );

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
                        .submitCollection(data, fund.id, overwriteUids, {
                            name: csvFile.name,
                            content: await fileToText(csvFile),
                            total: data.length,
                            chunk: currentChunkNth,
                            chunks: chunksCount,
                            chunkSize: dataChunkSize,
                        })
                        .then(() => {
                            currentChunkNth++;
                            updateProgressBarValue((currentChunkNth / chunksCount) * 100);

                            if (currentChunkNth == chunksCount) {
                                setTimeout(() => {
                                    setCsvProgressBar(100);
                                    setCsvProgress(3);
                                    onUpdated?.();
                                    resolve(null);
                                }, 0);
                            } else {
                                if (abort.current) {
                                    return (abort.current = false);
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
            onUpdated,
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

                            onUpdated?.();
                            setCsvProgress(3);
                            updateProgressBarValue(100);
                            pushSuccess('Klaar!', skipUids.length + ' gegevens overgeslagen, geen nieuwe aangemaakt!');
                        }}
                        onCancel={() => {
                            onUpdated?.();
                        }}
                    />
                ));
            }
        },
        [fund.csv_primary_key, onUpdated, openModal, pushSuccess, startUploadingToServer, updateProgressBarValue],
    );

    const submitCollectionCheck = useCallback(() => {
        setCsvProgress(2);
        abort.current = false;

        const submitData = chunkList(JSON.parse(JSON.stringify(data)), dataChunkSize);
        const chunksCount = submitData.length;

        let currentChunkNth = 0;

        updateProgressBarValue(0);
        let collection = [];
        let collectionDb = [];

        const uploadChunk = function (data: Array<string>) {
            prevalidationService
                .submitCollectionCheck(data, fund.id, [])
                .then((res) => {
                    currentChunkNth++;
                    updateProgressBarValue((currentChunkNth / chunksCount) * 100);
                    collection = [...collection, ...res.data.collection];
                    collectionDb = [...collectionDb, ...res.data.db];

                    if (currentChunkNth == chunksCount) {
                        setTimeout(() => {
                            pushSuccess('Vergelijken...', 'Gegevens ingeladen! Vergelijken met .csv...', {
                                icon: 'timer-sand',
                            });

                            compareCsvAndDb(
                                collection.map((row) => ({ _uid: uniqueId('rand_'), ...row })),
                                collectionDb.map((row) => ({ _uid: uniqueId('rand_'), ...row })),
                            );
                        }, 0);
                    } else {
                        if (abort.current) {
                            return (abort.current = false);
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

        uploadChunk(submitData[currentChunkNth]);
    }, [
        chunkList,
        compareCsvAndDb,
        data,
        dataChunkSize,
        fund?.id,
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

    const addSinglePrevalidation = useCallback(() => {
        openModal((modal) => (
            <ModalCreatePrevalidation
                modal={modal}
                fund={fund}
                recordTypes={recordTypes}
                onCreated={() => onUpdated?.()}
            />
        ));
    }, [fund, onUpdated, openModal, recordTypes]);

    const downloadSample = useCallback(() => {
        fileService.downloadFile((fund.key || 'fund') + '_sample.csv', fundService.sampleCSV(fund));
    }, [fileService, fund, fundService]);

    useEffect(() => {
        return () => reset();
    }, [reset]);

    return (
        <div
            className={`block block-csv ${isDragOver ? 'is-dragover' : ''}`}
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

                <div className="csv-upload-btn-groups">
                    <div className="button-group flex-center">
                        {csvProgress <= 1 && (
                            <button
                                id="add_single_prevalidation"
                                className="button button-default"
                                onClick={addSinglePrevalidation}>
                                <em className="mdi mdi-plus icon-start" />
                                Activatiecode aanmaken
                            </button>
                        )}

                        {csvProgress <= 1 && (
                            <button className="button button-primary" onClick={() => inputRef.current.click()}>
                                <em className="mdi mdi-upload icon-start" />
                                {translate('csv_upload.labels.upload')}
                            </button>
                        )}
                    </div>

                    <div className="button-group flex-center">
                        {csvProgress <= 1 && (
                            <button
                                className="button button-text button-text-muted button-slim"
                                onClick={downloadSample}>
                                <em className="mdi mdi-file-table-outline icon-start" />
                                Download voorbeeld bestand
                            </button>
                        )}
                    </div>
                </div>

                {csvProgress >= 2 && (
                    <div className={`csv-upload-progress ${csvProgress === 3 ? 'done' : ''}`}>
                        <div className="csv-upload-icon">
                            {csvProgress === 2 && <div className="mdi mdi-loading" />}
                            {csvProgress === 3 && <div className="mdi mdi-check" />}
                        </div>

                        <CSVProgressBar progressBar={csvProgressBar} status={progressStatus} />
                    </div>
                )}

                {csvProgress <= 1 && csvFile && (
                    <div className="csv-upload-actions">
                        {csvFile && (
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
                                    <div className="file-remove mdi mdi-close" onClick={reset} />
                                </div>

                                {csvProgress == 1 && csvIsValid && !csvComparing && (
                                    <div className="block-file-buttons">
                                        <div className="button-group flex-center">
                                            <button className="button button-default button-sm" onClick={reset}>
                                                Cancel
                                            </button>

                                            <button
                                                className="button button-primary button-sm"
                                                onClick={onConfirmUpload}>
                                                Upload
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {csvWarnings && !csvErrors && (
                            <div className="csv-file-warning">
                                {[].concat(csvWarnings).map((warning) => (
                                    <div key={warning}>{warning}</div>
                                ))}
                            </div>
                        )}

                        {csvErrors && (
                            <Fragment>
                                {[].concat(csvErrors).map((error, index) => (
                                    <div key={index} className="csv-file-error">
                                        {error}
                                    </div>
                                ))}
                            </Fragment>
                        )}
                    </div>
                )}

                {csvProgress == 3 && (
                    <div className="text-center">
                        <button type={'button'} className="button button-primary" onClick={reset}>
                            {translate('csv_upload.labels.done')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
