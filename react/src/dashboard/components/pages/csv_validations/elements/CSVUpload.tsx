import React, { Fragment, useContext, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import Fund from '../../../../props/models/Fund';
import { useFundService } from '../../../../services/FundService';
import { useTranslation } from 'react-i18next';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalCreatePrevalidation from '../../../modals/ModalCreatePrevalidation';
import { useFileService } from '../../../../services/FileService';
import ProgressBar from '../../../elements/progress-bar/ProgressBar';
import RecordType from '../../../../props/models/RecordType';
import Papa from 'papaparse';
import { isEmpty } from 'lodash';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import { usePrevalidationService } from '../../../../services/PrevalidationService';
import ModalDuplicatesPicker from '../../../modals/ModalDuplicatesPicker';
import { CsvUploadContext } from '../../../../modules/csv_upload/CSVUploadContext';

export type CSVParserProp = {
    progress: number;
    progressBar?: number;
    isValid?: boolean;
    csvFile?: File;
    error?: Array<string>;
    warning?: Array<string>;
    comparing?: boolean;
    selectFile?: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
    setError?: (error: string | Array<string>, file?: File, progress?: number) => void;
    setWarning?: (warning: Array<string>) => void;
    uploadToServer?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    uploadFile?: (file: File) => void;
    data?: Array<string>;
    validateFile?: (data: Array<string>) => Array<string>;
    startUploadingToServer?: (newRecords: Array<string>, updateUids?: Array<string>) => Promise<string>;
    compareCsvAndDb?: (csvRecords: unknown, dbRecords: Array<{ uid_hash: string }>) => void;
};

export default function CSVUpload({ fund, recordTypes = [] }: { fund: Fund; recordTypes: Array<RecordType> }) {
    const { t } = useTranslation();

    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();

    const fundService = useFundService();
    const fileService = useFileService();
    const prevalidationService = usePrevalidationService();

    const [dataChunkSize] = useState<number>(100);
    const csvUploadedContext = useContext(CsvUploadContext);
    const [abort, setAbort] = useState<boolean>(false);
    const [progressBar, setProgressBar] = useState<number>(0);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [csvParser, setCSVParser] = useState<CSVParserProp>({ progress: 0 });
    const [input, setInput] = useState<HTMLInputElement>(document.createElement('input'));

    const elementRef = useRef(null);

    const recordTypeKeys = useMemo(() => {
        return recordTypes?.map((recordType) => recordType.key);
    }, [recordTypes]);

    const setProgress = useCallback((progress: number) => {
        setProgressBar(progress);

        if (progress < 100) {
            setProgressStatus('Aan het uploaden...');
        } else {
            setProgressStatus('Klaar!');
        }
    }, []);

    const chunk = useCallback((arr: Array<number>, len: number) => {
        const chunks = [];
        const n = arr.length;

        let i = 0;

        while (i < n) {
            chunks.push(arr.slice(i, (i += len)));
        }

        return chunks;
    }, []);

    const bind = useCallback(() => {
        csvParser.selectFile = function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (input && input.remove) {
                input.remove();
            }

            input.setAttribute('type', 'file');
            input.setAttribute('accept', '.csv');
            input.style.display = 'none';

            input.addEventListener('change', function () {
                csvParser.uploadFile(this.files[0]);
            });

            elementRef.current.appendChild(input);
            input.click();
        };

        csvParser.setError = (error: string | Array<string>, file: File = null, progress = 1) => {
            setCSVParser({
                ...csvParser,
                error: Array.isArray(error) ? error : [error],
                csvFile: file,
                progress: progress,
            });
        };

        csvParser.setWarning = (warning) => {
            setCSVParser({
                ...csvParser,
                warning: Array.isArray(warning) ? warning : [warning],
            });
        };

        csvParser.uploadFile = (file) => {
            if (file.name.indexOf('.csv') != file.name.length - 4) {
                return csvParser.setError('Kies eerst een .csv bestand.');
            }

            new Promise(function (resolve) {
                Papa.parse(file, {
                    complete: resolve,
                });
            }).then(function (results: Papa.ParseResult<Array<string>>) {
                const csvData = (results.data = results.data.filter((item) => !!item));
                const header = csvData.length > 0 ? csvData[0] : [];

                const body = (csvData.length > 0 ? csvData.slice(1) : []).filter((row) => {
                    return Array.isArray(row) && row.filter((item) => !!item).length > 0;
                });

                const fundRecordKey =
                    fund.csv_required_keys.filter((key) => {
                        return key.indexOf('_eligible') === key.length - 9;
                    })[0] || false;

                const fundRecordKeyValue =
                    fund.criteria?.filter(
                        (criteria) => criteria.record_type_key == fundRecordKey && criteria.operator == '=',
                    )[0]?.value || false;

                if (header.length == 0) {
                    return csvParser.setError('Het .csv bestand is leeg, controleer het bestand.', file);
                }

                if (body.length == 0) {
                    return csvParser.setError(
                        'Het .csv bestand heeft kolomnamen maar geen inhoud, controleer de inhoud.',
                        file,
                    );
                }

                if (fund && fundRecordKey && fundRecordKeyValue && header.indexOf(fundRecordKey) === -1) {
                    header.unshift(fundRecordKey);

                    body.forEach((row) => {
                        row.unshift(fundRecordKeyValue);
                    });
                }

                const invalidRecordTypes = header.filter((recordTypeKey) => {
                    return recordTypeKeys.indexOf(recordTypeKey) == -1;
                });

                const missingRecordTypes = fund.csv_required_keys.filter((recordTypeKey: string) => {
                    return header.indexOf(recordTypeKey) == -1;
                });

                const optionalRecordTypes = header.filter((recordTypeKey) => {
                    return fund.csv_required_keys.indexOf(recordTypeKey) == -1;
                });

                if (invalidRecordTypes.length > 0) {
                    return csvParser.setError(
                        `Het .csv bestand heeft de volgende ongeldige eigenschappen: '${invalidRecordTypes.join(
                            "', '",
                        )}'`,
                        file,
                    );
                }

                if (missingRecordTypes.length > 0) {
                    return csvParser.setError(
                        `In het .csv bestand ontbreken eigenschappen die verplicht zijn voor dit fonds '${
                            fund.name
                        }': '${missingRecordTypes.join("', '")}'`,
                        file,
                    );
                }

                if (optionalRecordTypes.length > 0) {
                    csvParser.setWarning([
                        `In het .csv bestand zijn eigenschappen toegevoegd die ' + 'optioneel zijn voor "${fund.name}" fonds.'`,
                        'Controleer of deze eigenschappen echt nodig zijn voor de toekenning.',
                        `De volgende eigenschappen zijn optioneel: "${optionalRecordTypes.join("', '")}".'`,
                    ]);
                }

                csvParser.data = body.reduce(function (result, val) {
                    const row = {};

                    header.forEach((hVal, hKey) => {
                        if (val[hKey] && val[hKey] != '') {
                            row[hVal] = val[hKey];
                        }
                    });

                    if (isEmpty(row)) {
                        return result;
                    }

                    if (typeof row === 'string') {
                        result.push(row);
                    }
                    return result;
                }, []);

                const invalidRows = csvParser.validateFile(csvParser.data);

                if (invalidRows.length > 0) {
                    return csvParser.setError(
                        ['Volgende problemen zijn opgetreden bij dit .csv bestand:'].concat(invalidRows),
                        file,
                    );
                }

                setCSVParser({
                    ...csvParser,
                    csvFile: file,
                    progress: 1,
                    isValid: invalidRows.length === 0,
                });
            }, console.error);
        };

        csvParser.validateFile = function (data) {
            return data
                .map((row, row_key) => {
                    const rowRecordKeys = Object.keys(row);

                    const missingRecordTypes = fund.csv_required_keys.filter((recordTypeKey) => {
                        return rowRecordKeys.indexOf(recordTypeKey) == -1;
                    });

                    if (missingRecordTypes.length > 0) {
                        return `Lijn ${
                            row_key + 1
                        }: heet ontbrekende verplichte eigenschappen: "${missingRecordTypes.join('", "')}"`;
                    }

                    return null;
                })
                .filter((error) => error !== null);
        };

        csvParser.uploadToServer = function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!csvParser.isValid) {
                return false;
            }

            csvParser.comparing = true;

            pushSuccess('Inladen...', 'Inladen van gegevens voor controle op dubbele waarden!');

            prevalidationService.submitCollectionCheck(csvParser.data, fund.id, []).then((res) => {
                pushSuccess('Vergelijken...', 'Gegevens ingeladen! Vergelijken met .csv...');

                window.setTimeout(() => {
                    csvParser.compareCsvAndDb(res.data.collection, res.data.db);
                }, 500);
            });
        };

        csvParser.compareCsvAndDb = (
            csvRecords: Array<{ data: unknown; uid_hash: string; records_hash: string }>,
            dbRecords: Array<{ uid_hash: string; records_hash: string }>,
        ) => {
            const primaryKey = fund.csv_primary_key;

            const dbPrimaryKeys = dbRecords.reduce((obj, row) => {
                obj[row.uid_hash] = true;
                return obj;
            }, {});

            const dbPrimaryFullKeys = dbRecords.reduce((obj, row) => {
                obj[row.uid_hash + '_' + row.records_hash] = true;
                return obj;
            }, {});

            const newRecords = [];
            const updatedRecords = [];
            const existingRecords = [];

            for (let index = 0; index < csvRecords.length; index++) {
                if (dbPrimaryKeys[csvRecords[index].uid_hash]) {
                    if (dbPrimaryFullKeys[csvRecords[index].uid_hash + '_' + csvRecords[index].records_hash]) {
                        existingRecords.push(csvRecords[index].data);
                    } else {
                        updatedRecords.push(csvRecords[index].data);
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

                    csvParser.startUploadingToServer(newRecords);
                } else {
                    pushSuccess('Niks veranderd!', 'Geen nieuwe gegevens gevonden in uw .csv bestand...');

                    csvParser.progressBar = 100;
                    csvParser.progress = 3;
                    setProgress(100);
                }
            } else {
                const items = updatedRecords.map((row) => ({
                    value: row[primaryKey],
                }));

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={'Dubbele gegevens gedetecteerd.'}
                        hero_subtitle={[
                            `Weet u zeker dat u voor ${items.length} rijen gegevens wilt aanpassen?` +
                                'Deze nummers hebben al een activatiecode.',
                        ]}
                        enableToggles={true}
                        label_on={'Aanpassen'}
                        label_off={'Overslaan'}
                        button_none={'Alles overslaan'}
                        button_all={'Pas alles aan'}
                        items={items}
                        onConfirm={(items) => {
                            const skipUids = items.filter((item) => !item.model).map((item) => item.value);
                            const updateUids = items.filter((item) => item.model).map((item) => item.value);

                            const newAndUpdatedRecords = updatedRecords
                                .filter((csvRow) => {
                                    return skipUids.indexOf(csvRow[primaryKey]) === -1;
                                })
                                .concat(newRecords);

                            pushSuccess(
                                'Uploading!',
                                [
                                    updatedRecords.length - skipUids.length + ' gegeven(s) worden vervangen en ',
                                    newRecords.length + ' gegeven(s) worden aangemaakt!',
                                ].join(''),
                            );

                            if (newAndUpdatedRecords.length > 0) {
                                return csvParser.startUploadingToServer(newAndUpdatedRecords, updateUids).then(() => {
                                    if (skipUids.length > 0) {
                                        pushSuccess('Klaar!', skipUids.length + ' gegeven(s) overgeslagen!');
                                    }

                                    pushSuccess(
                                        'Klaar!',
                                        updatedRecords.length - skipUids.length + ' gegevens vervangen!',
                                    );

                                    pushSuccess('Klaar!', newRecords.length + 'nieuwe gegeven(s) aangemaakt!');
                                }, console.error);
                            }

                            window.setTimeout(() => {
                                setCSVParser({
                                    ...csvParser,
                                    progressBar: 100,
                                    progress: 3,
                                });
                                setProgress(100);

                                pushSuccess(
                                    'Klaar!',
                                    skipUids.length + ' gegevens overgeslagen, geen nieuwe aangemaakt!',
                                );
                            }, 0);
                        }}
                        onCancel={() => {
                            console.log('csv:uploaded');
                        }}
                    />
                ));
            }
        };

        csvParser.startUploadingToServer = (data, overwriteUids: Array<string> = []) => {
            return new Promise((resolve, reject) => {
                csvParser.progress = 2;

                const submitData = chunk(JSON.parse(JSON.stringify(data)), dataChunkSize);
                const chunksCount = submitData.length;
                let currentChunkNth = 0;

                setProgress(0);

                const uploadChunk = function (data) {
                    prevalidationService.submitCollection(data, fund.id, overwriteUids).then(
                        () => {
                            currentChunkNth++;
                            setProgress((currentChunkNth / chunksCount) * 100);

                            if (currentChunkNth == chunksCount) {
                                setTimeout(() => {
                                    setCSVParser({
                                        ...csvParser,
                                        progressBar: 100,
                                        progress: 3,
                                    });
                                    csvUploadedContext(true);

                                    resolve(null);
                                }, 0);
                            } else {
                                if (!abort) {
                                    uploadChunk(submitData[currentChunkNth]);
                                }
                            }
                        },
                        (res) => {
                            if (res.status == 422 && res.data.errors.data) {
                                return alert(res.data.errors.data[0]);
                            }

                            alert('Onbekende error.');
                            reject();
                        },
                    );
                };

                uploadChunk(submitData[currentChunkNth]);
            });
        };
    }, [
        abort,
        chunk,
        csvParser,
        csvUploadedContext,
        dataChunkSize,
        fund,
        input,
        openModal,
        prevalidationService,
        pushSuccess,
        recordTypeKeys,
        setProgress,
    ]);

    const reset = useCallback(() => {
        setInput(document.createElement('input'));
        setCSVParser({ progress: 0 });
        bind();
    }, [bind]);

    const addSinglePrevalidation = useCallback(() => {
        openModal((modal) => <ModalCreatePrevalidation modal={modal} fund={fund} recordTypes={recordTypes} />);
    }, [fund, openModal, recordTypes]);

    const downloadSample = useCallback(() => {
        fileService.downloadFile((fund.key || 'fund') + '_sample.csv', fundService.sampleCSV(fund));
    }, [fileService, fund, fundService]);

    const cleanup = useCallback(() => {
        setAbort(true);
    }, []);

    useEffect(() => {
        bind();

        return () => {
            cleanup();
        };
    }, [bind, cleanup]);

    return (
        <div className="block block-csv" ref={elementRef}>
            <div className="csv-inner">
                {csvParser.progress <= 1 && (
                    <div className="csv-upload-btn" onClick={(e) => csvParser.selectFile(e)}>
                        <div className="csv-upload-icon">
                            <div className="mdi mdi-upload" />
                        </div>
                        <div className="csv-upload-text">
                            {t('csv_upload.labels.upload')}
                            <br />
                            <span>{t('csv_upload.labels.swipe')}</span>
                        </div>
                    </div>
                )}

                <div className="button-group flex-center">
                    {csvParser.progress <= 1 && (
                        <button
                            className="button button-default"
                            id="add_single_prevalidation"
                            onClick={() => addSinglePrevalidation()}>
                            <em className="mdi mdi-plus icon-start" />
                            <span>Activatiecode aanmaken</span>
                        </button>
                    )}

                    {csvParser.progress <= 1 && (
                        <button className="button button-primary" onClick={(e) => csvParser.selectFile(e)}>
                            <em className="mdi mdi-upload icon-start" />
                            <span>{t('csv_upload.labels.upload')}</span>
                        </button>
                    )}
                </div>

                <div className="button-group flex-center">
                    {csvParser.progress <= 1 && (
                        <button className="button button-text button-text-muted" onClick={() => downloadSample()}>
                            <em className="mdi mdi-file-table-outline icon-start" />
                            <span>Download voorbeeld bestand</span>
                        </button>
                    )}
                </div>

                {csvParser.progress >= 2 && (
                    <div className="csv-upload-progress">
                        <div className="csv-upload-icon">
                            <div className="mdi" />
                        </div>

                        <ProgressBar progressBar={progressBar} status={progressStatus} />
                    </div>
                )}

                <div className="csv-upload-actions">
                    {((csvParser?.csvFile && csvParser.progress < 2) || csvParser?.error || csvParser?.warning) && (
                        <Fragment>
                            <div className="csv-file">
                                <div className={`block block-file ${csvParser.isValid ? '' : 'has-error'}`}>
                                    <div className="file-error mdi mdi-close-circle" />
                                    <div className="file-name">{csvParser.csvFile.name}</div>
                                    <div className="file-size">{csvParser.csvFile.size}</div>
                                    <div className="file-remove mdi mdi-close" onClick={() => reset()} />
                                </div>

                                {csvParser.warning && !csvParser.error && (
                                    <Fragment>
                                        {csvParser.warning.map((warning) => (
                                            <div key={warning} className="csv-file-warning">
                                                {warning}
                                            </div>
                                        ))}
                                    </Fragment>
                                )}

                                {csvParser.error && (
                                    <Fragment>
                                        {csvParser.error.map((error, index) => (
                                            <div key={index} className="csv-file-error">
                                                {error}
                                            </div>
                                        ))}
                                    </Fragment>
                                )}
                            </div>

                            {csvParser.progress == 1 && csvParser.isValid && (
                                <div className="text-center">
                                    {csvParser.comparing && (
                                        <button
                                            className="button button-primary"
                                            onClick={(e) => csvParser.uploadToServer(e)}>
                                            {t('csv_upload.labels.upload')}
                                        </button>
                                    )}
                                </div>
                            )}

                            {csvParser.progress == 3 && (
                                <div className="text-center">
                                    <button className="button button-primary" onClick={() => reset()}>
                                        {t('csv_upload.labels.done')}
                                    </button>
                                </div>
                            )}
                        </Fragment>
                    )}
                </div>
            </div>
        </div>
    );
}
