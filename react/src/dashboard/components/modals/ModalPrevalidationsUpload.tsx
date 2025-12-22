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
import { ProfileRecordType } from '../../props/models/Sponsor/SponsorIdentity';

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
    line: number;
    uid_hash: string;
    records_hash: string;
    records_amount?: string;
    db?: RowDataDBProp;
    data: RowDataPropData;
};

type RowDataDBProp = {
    id: number;
    uid_hash: string;
    records_hash: string;
    state: 'pending' | 'used';
    vouchers: Array<{ id: number; amount: string }>;
};

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

    const [fund, setFund] = useState<Fund>(funds?.find((fund) => fund.id == fundId) || funds[0]);
    const [step, setStep] = useState<Steps>(Steps.select_fund);
    const [data, setData] = useState<Array<RowDataPropData>>(null);
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
    const [csvProgress, setCsvProgress] = useState<CSVProgress>(CSVProgress.initial);

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

    const validateCsvData = useCallback(
        function (data: Array<RowDataPropData>): Array<string> {
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

            const invalidRecordTypes = header.filter((recordTypeKey: ProfileRecordType) => {
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
            }, []) as RowDataPropData[];

            const invalidRows = validateCsvData(parsedData);

            if (invalidRows.length > 0) {
                csvErrors.invalidRows = ['Volgende problemen zijn opgetreden bij dit .csv bestand:', ...invalidRows];
            }

            setCsvFile(file);

            setCsvErrors(csvErrors);
            setCsvWarnings(csvWarnings);

            setData(parsedData);
            setCsvIsValid(Object.keys(csvErrors).length === 0);
            setCsvProgress(CSVProgress.validated);
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
        (data: Array<RowDataPropData>, overwriteUids: Array<RowDataProp> = [], topUpUids: Array<RowDataProp> = []) => {
            return new Promise((resolve, reject) => {
                setCsvProgress(CSVProgress.uploading);

                const submitData = chunkList(JSON.parse(JSON.stringify(data)), dataChunkSize);
                const chunksCount = submitData.length;

                let currentChunkNth = 0;

                updateProgressBarValue(0);

                const uploadChunk = async function (data: Array<{ [key: string]: string }>) {
                    prevalidationService
                        .storeBatch(
                            fund.organization_id,
                            data,
                            fund.id,
                            overwriteUids.map((row) => row.data[fund.csv_primary_key]),
                            topUpUids.map((row) => ({
                                key: row.data[fund.csv_primary_key],
                                voucher_id: row.db.vouchers[0]?.id,
                            })),
                            {
                                name: csvFile.name,
                                content: await fileToText(csvFile),
                                total: data.length,
                                chunk: currentChunkNth,
                                chunks: chunksCount,
                                chunkSize: dataChunkSize,
                            },
                        )
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
        },
        [
            chunkList,
            dataChunkSize,
            updateProgressBarValue,
            prevalidationService,
            fund.id,
            fund.organization_id,
            fund.csv_primary_key,
            csvFile,
            onCompleted,
            pushApiError,
            showInvalidRows,
            pushDanger,
        ],
    );

    const showErrorsList = useCallback(
        async (data: Array<RowDataProp>, title: string, subtitle: string, rowLabel: (row: RowDataProp) => string) => {
            const items = data.map((row) => ({
                _uid: row._uid,
                label: rowLabel(row),
            }));

            setHideModal(true);

            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={title}
                        hero_subtitle={subtitle}
                        enableToggles={false}
                        label_on={'Aanmaken'}
                        label_off={'Overslaan'}
                        items={items}
                        onConfirm={() => {
                            setHideModal(false);
                            resolve(true);
                        }}
                        onCancel={() => {
                            setHideModal(false);
                            resolve(true);
                        }}
                    />
                ));
            });
        },
        [openModal],
    );

    const showUpdateList = useCallback(
        async (data: Array<RowDataProp>, title: string, subtitle: string, rowLabel: (row: RowDataProp) => string) => {
            return new Promise<{ skipUids: Array<string>; updateUids: Array<string> } | false>((resolve) => {
                const items = data.map((row) => ({
                    _uid: row._uid,
                    label: rowLabel(row),
                    value: row[fund.csv_primary_key],
                }));

                setHideModal(true);

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={title}
                        hero_subtitle={subtitle}
                        enableToggles={true}
                        label_on={'Aanpassen'}
                        label_off={'Overslaan'}
                        button_none={'Alles overslaan'}
                        button_all={'Pas alles aan'}
                        items={items}
                        onConfirm={({ list }) => {
                            const skipUids = list.filter((item) => !item.model).map((item) => item._uid);
                            const updateUids = list.filter((item) => item.model).map((item) => item._uid);

                            resolve({ skipUids, updateUids });
                        }}
                        onCancel={() => {
                            setHideModal(false);
                            resolve(false);
                        }}
                    />
                ));
            });
        },
        [fund.csv_primary_key, openModal],
    );

    const compareCsvAndDb = useCallback(
        async (dbRecords: Array<RowDataDBProp>, csvRecords: Array<RowDataProp>) => {
            const data = csvRecords.reduce<{
                create: RowDataProp[];
                update: RowDataProp[];
                top_up: RowDataProp[];
                same_amount: RowDataProp[];
                less_amount: RowDataProp[];
                no_vouchers: RowDataProp[];
                multiple_vouchers: RowDataProp[];
            }>(
                (list, csvItem) => {
                    const dbItem = dbRecords.find((dbRow) => dbRow.uid_hash === csvItem.uid_hash);

                    if (!dbItem) {
                        list.create.push(csvItem);
                        return list;
                    }

                    if (dbItem.state === 'pending' && csvItem.records_hash !== dbItem.records_hash) {
                        list.update.push({ ...csvItem, db: dbItem });
                        return list;
                    }

                    if (dbItem.state === 'used' && dbItem.records_hash != csvItem.records_hash) {
                        if (dbItem.vouchers.length === 0) {
                            list.no_vouchers.push({ ...csvItem, db: dbItem });
                        }

                        if (dbItem.vouchers.length > 1) {
                            list.multiple_vouchers.push({ ...csvItem, db: dbItem });
                        }

                        if (dbItem.vouchers.length === 1) {
                            if (parseFloat(dbItem.vouchers[0]?.amount) > parseFloat(csvItem.records_amount)) {
                                list.less_amount.push({ ...csvItem, db: dbItem });
                            }

                            if (parseFloat(dbItem.vouchers[0]?.amount) === parseFloat(csvItem.records_amount)) {
                                list.same_amount.push({ ...csvItem, db: dbItem });
                            }

                            if (parseFloat(dbItem.vouchers[0]?.amount) < parseFloat(csvItem.records_amount)) {
                                list.top_up.push({ ...csvItem, db: dbItem });
                            }
                        }

                        return list;
                    }

                    return list;
                },
                {
                    create: [], // to create
                    update: [], // to update
                    top_up: [], // top-up required
                    same_amount: [], // noting to do
                    less_amount: [], // can't subtract
                    no_vouchers: [], // can't find the voucher
                    multiple_vouchers: [], // multiple vouchers - ambiguous case
                },
            );

            // Data has changed for used prevalidation but could not fund a voucher for top-up
            if (data.no_vouchers?.length > 0) {
                await showErrorsList(
                    data.no_vouchers,
                    'Geen tegoed gevonden',
                    'De gegevens zijn niet gewijzigd. We kunnen geen actief tegoed vinden voor dit account. Het tegoed is mogelijk gedeactiveerd.',
                    (row) => {
                        return `Lijn: ${row.line} - Geen tegoed gevonden voor "${row.data[fund.csv_primary_key]}"`;
                    },
                );
            }

            // Data has changed for used prevalidation but since there are multiple vouchers it's not clear which one should be updated
            if (data.multiple_vouchers?.length > 0) {
                await showErrorsList(
                    data.multiple_vouchers,
                    'Meerdere actieve tegoeden gevonden',
                    'Er zijn meerdere actieve tegoeden voor dit account. Het is niet duidelijk welk tegoed moet worden aangepast. Controleer handmatig of dit klopt en welk tegoed aangepast moet worden. Voorbeeld casus: een persoon heeft handmatig al een tegoed ontvangen',
                    (row) => {
                        return `Lijn: ${row.line} - Meerdere tegoeden gevonden voor "${row.data[fund.csv_primary_key]}"`;
                    },
                );
            }

            // Data has changed but the amount remained the same
            if (data.same_amount?.length > 0) {
                await showErrorsList(
                    data.same_amount,
                    'Geen wijziging in bedrag gedetecteerd',
                    'De gegevens zijn gewijzigd, maar het bedrag blijft hetzelfde. Er worden geen updates toegepast.',
                    (row) => {
                        return `Lijn: ${row.line} - Gegevens gewijzigd maar bedrag ongewijzigd voor "${row.data[fund.csv_primary_key]}"`;
                    },
                );
            }

            // Data has changed but the amount is now lower
            if (data.less_amount?.length > 0) {
                await showErrorsList(
                    data.less_amount,
                    'Gegevens kunnen niet worden aangepast',
                    'Als gegevens worden verlaagd, kunnen actieve tegoeden niet automatisch worden aangepast. Pas het tegoed daarom handmatig aan. Voorbeeld casus: een actief tegoed voor 2 personen wordt aangepast naar 1 persoon.',
                    (row) => {
                        return `Lijn: ${row.line} - Gegevens kunnen niet worden aangepast voor "${row.data[fund.csv_primary_key]}"`;
                    },
                );
            }

            if (data.update.length === 0 && data.top_up.length === 0) {
                if (data.create.length > 0) {
                    pushSuccess(
                        'Bezig met uploaden...',
                        'Geen dubbelingen gevonden. Bezig met uploaden van ' +
                            data.create.length +
                            ' nieuw(e) gegeven(s)...',
                    );

                    startUploadingToServer(data.create.map((item) => item.data)).then();
                } else {
                    pushSuccess('Geen wijzigingen gedetecteerd', 'Geen nieuwe gegevens gevonden in uw CSV-bestand...');
                    setCsvProgress(CSVProgress.uploaded);
                    updateProgressBarValue(100);
                }

                return;
            }

            let updateUids = [];
            let topUpUids = [];
            let skipUids = [];

            if (data.update.length > 0) {
                await showUpdateList(
                    data.update,
                    'Dubbele gegevens gevonden',
                    [
                        `Bevestig dat u ${data.update.length} rij(en) wilt bijwerken. Deze accounts hebben al een toekenning en activatiecode.`,
                        'Er wordt extra tegoed toegevoegd.',
                    ].join(' '),
                    (row) => {
                        return `Lijn: ${row.line} - Wachtende gegevens gewijzigd voor "${row.data[fund.csv_primary_key]}"`;
                    },
                ).then((res) => {
                    if (res === false) {
                        onCompleted?.();
                        closeModal();
                        return;
                    }

                    skipUids = res.skipUids;
                    updateUids = res.updateUids;
                });
            }

            if (data.top_up.length > 0) {
                await showUpdateList(
                    data.top_up,
                    'Extra tegoed klaarzetten',
                    [
                        `Bevestig dat u ${data.top_up.length} rij(en) wilt bijwerken.`,
                        'Deze accounts hebben al een activatiecode en het tegoed is al geactiveerd.',
                        'Omdat er een extra toekenning wordt toegevoegd, wordt er extra tegoed klaargezet.',
                        'Het bestaande tegoed wordt verhoogd.',
                    ].join(' '),
                    (row) => {
                        return `Lijn: ${row.line} - Gebruikte gegevens gewijzigd voor "${row.data[fund.csv_primary_key]}"`;
                    },
                ).then((res) => {
                    if (res === false) {
                        onCompleted?.();
                        closeModal();
                        return;
                    }

                    skipUids = [...skipUids, ...res.skipUids];
                    topUpUids = res.updateUids;
                });
            }

            const updateRows = data.update.filter((row) => updateUids.includes(row._uid));
            const topUpRows = data.top_up.filter((row) => topUpUids.includes(row._uid));

            const newAndUpdatedRecords = [...data.update, ...data.top_up]
                .filter((csvRow) => !skipUids.includes(csvRow._uid))
                .concat(data.create);

            pushSuccess(
                'Bezig met uploaden...',
                [
                    `${data.update.length + data.top_up.length - skipUids.length} gegeven(s) worden bijgewerkt en`,
                    `${data.create.length} gegeven(s) worden aangemaakt!`,
                ].join(' '),
            );

            setHideModal(false);

            if (newAndUpdatedRecords.length > 0) {
                return startUploadingToServer(
                    newAndUpdatedRecords.map((item) => item.data),
                    updateRows,
                    topUpRows,
                ).then(() => {
                    if (skipUids.length > 0) {
                        pushSuccess('Voltooid', `${skipUids.length} gegeven(s) overgeslagen!`);
                    }

                    pushSuccess('Voltooid', `${data.update.length - skipUids.length} gegeven(s) bijgewerkt!`);
                    pushSuccess('Voltooid', `${data.create.length} nieuw(e) gegeven(s) aangemaakt!`);
                }, console.error);
            }

            onCompleted?.();
            setCsvProgress(CSVProgress.uploaded);
            updateProgressBarValue(100);
            pushSuccess('Voltooid', skipUids.length + ' gegeven(s) overgeslagen, geen nieuwe gegevens aangemaakt!');
        },
        [
            fund.csv_primary_key,
            onCompleted,
            closeModal,
            pushSuccess,
            showErrorsList,
            showUpdateList,
            startUploadingToServer,
            updateProgressBarValue,
        ],
    );

    const submitCollectionCheck = useCallback(() => {
        setCsvProgress(CSVProgress.uploading);
        abortRef.current = false;

        const submitData: RowDataPropData[][] = chunkList(JSON.parse(JSON.stringify(data)), dataChunkSize);
        const chunksCount = submitData.length;

        let currentChunkNth = 0;
        let collectionDb: RowDataDBProp[] = [];
        let collectionCsv: RowDataProp[] = [];

        updateProgressBarValue(0);

        const uploadChunk = function (chunkData: Array<RowDataPropData>) {
            prevalidationService
                .submitCollectionCheck<{
                    db: Array<RowDataDBProp>;
                    collection: Array<RowDataProp>;
                }>(fund.organization_id, chunkData, fund.id)
                .then((res) => {
                    currentChunkNth++;
                    updateProgressBarValue((currentChunkNth / chunksCount) * 100);

                    collectionDb = [...collectionDb, ...res.data.db];
                    collectionCsv = [
                        ...collectionCsv,
                        ...res.data.collection.map((collectionItem) => ({
                            ...collectionItem,
                            line:
                                data.findIndex((dataItem) => {
                                    return dataItem[fund.csv_primary_key] == collectionItem.data[fund.csv_primary_key];
                                }) + 1,
                        })),
                    ];

                    if (currentChunkNth == chunksCount) {
                        setTimeout(() => {
                            setLoading(false);

                            pushSuccess('Vergelijken...', 'Gegevens ingeladen! Vergelijken met .csv...', {
                                icon: 'timer-sand',
                            });

                            compareCsvAndDb(
                                collectionDb.map((row) => ({ _uid: uniqueId('rand_'), ...row })),
                                collectionCsv.map((row) => ({ _uid: uniqueId('rand_'), ...row })),
                            ).then();
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
                            : pushDanger('Onbekende fout.');
                    }

                    pushApiError(err, 'Onbekende fout.');
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
        fund?.csv_primary_key,
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
                step == Steps.select_fund ? 'modal-md' : 'modal-bulk-upload',
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
                            disabled={step == Steps.select_fund || loading}
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
                                {csvProgress < CSVProgress.uploaded ? (
                                    <button
                                        className="button button-primary"
                                        onClick={onConfirmUpload}
                                        disabled={
                                            csvProgress != CSVProgress.validated ||
                                            loading ||
                                            !csvIsValid ||
                                            csvComparing
                                        }
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
