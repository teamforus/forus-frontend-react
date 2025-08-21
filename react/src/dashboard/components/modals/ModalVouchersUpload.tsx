import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useSetProgress from '../../hooks/useSetProgress';
import Fund from '../../props/models/Fund';
import { useFileService } from '../../services/FileService';
import useVoucherService from '../../services/VoucherService';
import { currencyFormat, fileSize } from '../../helpers/string';
import Papa from 'papaparse';
import { chunk, groupBy, isEmpty, sortBy, uniq, map, countBy, keyBy, uniqueId } from 'lodash';
import Organization from '../../props/models/Organization';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import { ResponseError } from '../../props/ApiResponses';
import { dateFormat } from '../../helpers/dates';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import { useHelperService } from '../../services/HelperService';
import SponsorVoucher from '../../props/models/Sponsor/SponsorVoucher';
import Product from '../../props/models/Product';
import useProductService from '../../services/ProductService';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useOpenModal from '../../hooks/useOpenModal';
import CSVProgressBar from '../elements/csv-progress-bar/CSVProgressBar';
import useTranslate from '../../hooks/useTranslate';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import classNames from 'classnames';
import FormGroupInfo from '../elements/forms/elements/FormGroupInfo';
import usePushInfo from '../../hooks/usePushInfo';
import TranslateHtml from '../elements/translate-html/TranslateHtml';
import { fileToText } from '../../helpers/utils';

type CSVErrorProp = {
    csvHasBsnWhileNotAllowed?: boolean;
    csvAmountMissing?: boolean;
    csvProductIdPresent?: boolean;
    invalidAmountField?: boolean;
    invalidPerVoucherAmount?: boolean;
    csvHasMissingProductId?: boolean;
    csvProductsInvalidStockIds?: Array<RowDataProp>;
    csvProductsInvalidUnknownIds?: Array<RowDataProp>;
    csvProductsInvalidStockIdsList?: string;
    csvProductsInvalidUnknownIdsList?: string;
    hasAmountField?: boolean;
    hasInvalidFundIds?: boolean;
    hasInvalidFundIdsList?: string;
};

type RowDataProp = {
    _uid?: string;
    amount?: number;
    expires_at?: string;
    note?: string;
    bsn?: string;
    email?: string;
    fund_id?: number;
    activation_code_uid?: string;
    activate?: number;
    activation_code?: string;
    client_uid?: string;
    product_id?: number;
};

export default function ModalVouchersUpload({
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
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const authIdentity = useAuthIdentity();

    const fileService = useFileService();
    const helperService = useHelperService();
    const productService = useProductService();
    const voucherService = useVoucherService();

    const [STEP_SET_UP] = useState(1);
    const [STEP_UPLOAD] = useState(2);

    const [type, setType] = useState<'fund_voucher' | 'product_voucher'>('fund_voucher');
    const [data, setData] = useState<Array<RowDataProp>>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [changed, setChanged] = useState<boolean>(false);
    const [csvFile, setCsvFile] = useState<File>(null);
    const [products, setProducts] = useState<Array<Product>>(null);
    const [hideModal, setHideModal] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dataChunkSize] = useState<number>(50);

    const [csvErrors, setCsvErrors] = useState<CSVErrorProp>({});
    const [csvIsValid, setCsvIsValid] = useState(false);
    const [csvProgress, setCsvProgress] = useState<number>(0);

    const [availableFundsIds] = useState(funds.map((fund) => fund.id));
    const [availableFundsById] = useState(keyBy(funds, 'id'));

    const [fund, setFund] = useState<Partial<Fund>>(funds?.find((fund) => fund.id == fundId) || funds[0]);
    const [step, setStep] = useState(STEP_SET_UP);
    const [progressBar, setProgressBar] = useState<number>(0);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [acceptedFiles] = useState(['.csv']);

    const types = useMemo(
        () => [
            { key: 'fund_voucher', name: 'Budget' },
            { key: 'product_voucher', name: 'Product' },
        ],
        [],
    );

    const abortRef = useRef<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const productsIds = useMemo(() => {
        return products?.map((product) => product.id);
    }, [products]);

    const productsById = useMemo(() => {
        return products?.reduce((obj: Array<Product>, product) => ({ ...obj, [product.id]: product }), []);
    }, [products]);

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
        if (type == 'fund_voucher') {
            fileService.downloadFile(
                'budget_voucher_upload_sample.csv',
                voucherService.sampleCSVBudgetVoucher(fund.end_date),
            );
        } else {
            fileService.downloadFile(
                'product_voucher_upload_sample.csv',
                voucherService.sampleCSVProductVoucher(productsIds[0] || null, fund.end_date),
            );
        }
    }, [fileService, fund.end_date, productsIds, type, voucherService]);

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

    const validateProductId = useCallback(
        (data: Array<RowDataProp> = []) => {
            const allProductIds = countBy(data, 'product_id');

            const hasMissingProductId = data.filter((row: RowDataProp) => row.product_id === undefined).length > 0;
            const invalidProductIds = data.filter((row: RowDataProp) => !productsById[row.product_id]);
            const invalidStockIds = data
                .filter((row: RowDataProp) => productsById[row.product_id])
                .filter((row: RowDataProp) => {
                    return (
                        !productsById[row.product_id].unlimited_stock &&
                        productsById[row.product_id].stock_amount < allProductIds[row.product_id]
                    );
                });

            return {
                isValid: !invalidProductIds.length && !invalidStockIds.length,
                hasMissingProductId: hasMissingProductId,
                invalidStockIds: invalidStockIds,
                invalidProductIds: invalidProductIds,
            };
        },
        [productsById],
    );

    const getFundsById = useCallback(
        (fundIds: Array<number>) => {
            return funds.filter((fund) => fundIds.includes(fund.id));
        },
        [funds],
    );

    const validateCsvDataBudget = useCallback(
        (data: Array<{ [key: string]: string | number }>) => {
            const fundBudget = parseFloat(fund.limit_sum_vouchers);
            const csvTotalAmount: number = data.reduce(
                (sum: number, row: RowDataProp) => sum + (parseFloat(row.amount?.toString()) || 0),
                0,
            );

            const csvFundIds = data.map((row) => parseInt(row?.fund_id?.toString()));
            const csvBudgetFunds = getFundsById(csvFundIds);

            if (csvBudgetFunds.length > 0) {
                csvErrors.csvAmountMissing = data.filter((row: RowDataProp) => !row.amount).length > 0;

                // csv total amount should be withing fund budget
                csvErrors.invalidAmountField = csvTotalAmount > fundBudget;

                // some vouchers exceed the limit per voucher
                csvErrors.invalidPerVoucherAmount =
                    data.filter((row: RowDataProp) => row.amount > parseFloat(fund.limit_per_voucher)).length > 0;
            }

            // fund vouchers csv shouldn't have product_id field
            csvErrors.csvProductIdPresent = data.filter((row: RowDataProp) => row.product_id != undefined).length > 0;
            setCsvErrors({ ...csvErrors });

            return (
                !csvErrors.invalidAmountField &&
                !csvErrors.csvProductIdPresent &&
                !csvErrors.csvAmountMissing &&
                !csvErrors.invalidPerVoucherAmount
            );
        },
        [csvErrors, fund.limit_per_voucher, fund.limit_sum_vouchers, getFundsById],
    );

    const validateCsvDataProduct = useCallback(
        (data: RowDataProp[]) => {
            const validation = validateProductId(data);

            const newErrors = {
                ...csvErrors,
                csvHasMissingProductId: validation.hasMissingProductId,
                csvProductsInvalidStockIds: validation.invalidStockIds,
                csvProductsInvalidUnknownIds: validation.invalidProductIds,
                csvProductsInvalidStockIdsList: uniq(map(validation.invalidStockIds, 'product_id')).join(', '),
                csvProductsInvalidUnknownIdsList: uniq(map(validation.invalidProductIds, 'product_id')).join(', '),
                hasAmountField: data.some((row) => row.amount != undefined),
            };

            setCsvErrors(newErrors);

            return !newErrors.hasAmountField && !newErrors.csvHasMissingProductId && validation.isValid;
        },
        [csvErrors, validateProductId],
    );

    const pickSelectedOrUnflagged = useCallback(
        (rows: RowDataProp[], selectedUids: string[], flaggedIds: string[]): RowDataProp[] => {
            return rows.filter((row) => selectedUids.includes(row._uid) || !flaggedIds.includes(row._uid));
        },
        [],
    );

    const confirmLowAmountEntries = useCallback(
        (lowAmountRows: RowDataProp[], targetFund: Partial<Fund>, originalRows: RowDataProp[]) => {
            const lowAmountOptions = lowAmountRows.map((row) => ({
                _uid: row._uid,
                label: currencyFormat(parseFloat(row.amount?.toString() || '0')),
                columns: [targetFund.name],
            }));

            const lowAmountOptionIds = lowAmountOptions.map((opt) => opt._uid);

            return new Promise<RowDataProp[] | 'canceled'>((resolve) => {
                if (lowAmountOptions.length === 0) {
                    return resolve(originalRows);
                }

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={`Laag bedrag voor "${targetFund.name}".`}
                        hero_subtitle={[
                            `Er zijn ${lowAmountOptions.length} tegoeden met een laag bedrag.`,
                            'Wilt u doorgaan?',
                        ]}
                        button_none={'Alle overslaan'}
                        button_all={'Alle aanmaken'}
                        enableToggles={true}
                        label_on={'Aanmaken'}
                        label_off={'Overslaan'}
                        items={lowAmountOptions}
                        onConfirm={(data) => {
                            resolve(pickSelectedOrUnflagged(originalRows, data.uids, lowAmountOptionIds));
                        }}
                        onCancel={() => {
                            window.setTimeout(() => setHideModal(false), 300);
                            resolve('canceled');
                        }}
                    />
                ));
            });
        },
        [openModal, pickSelectedOrUnflagged],
    );

    const confirmDuplicateEmails = useCallback(
        (duplicateEmailRows: RowDataProp[], selectedFund: Partial<Fund>, originalRows: RowDataProp[]) => {
            const duplicateOptions = duplicateEmailRows.map((row) => ({
                _uid: row._uid,
                label: row.email,
                columns: [selectedFund.name],
            }));

            const duplicateOptionIds = duplicateOptions.map((opt) => opt._uid);

            return new Promise<RowDataProp[] | 'canceled'>((resolve) => {
                if (duplicateOptions.length === 0) {
                    return resolve(originalRows);
                }

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={`Dubbele e-mailadressen gedetecteerd voor "${selectedFund.name}".`}
                        hero_subtitle={[
                            `Weet u zeker dat u voor ${duplicateOptions.length} e-mailadres(sen) een extra tegoed wilt aanmaken?`,
                            'Deze e-mailadressen bezitten al een tegoed van dit fonds.',
                        ]}
                        button_none={'Alle overslaan'}
                        button_all={'Alle aanmaken'}
                        enableToggles={true}
                        label_on={'Aanmaken'}
                        label_off={'Overslaan'}
                        items={duplicateOptions}
                        onConfirm={(data) => {
                            resolve(pickSelectedOrUnflagged(originalRows, data.uids, duplicateOptionIds));
                        }}
                        onCancel={() => {
                            window.setTimeout(() => setHideModal(false), 300);
                            resolve('canceled');
                        }}
                    />
                ));
            });
        },
        [openModal, pickSelectedOrUnflagged],
    );

    const confirmDuplicateBsnEntries = useCallback(
        (duplicateBsnRows: RowDataProp[], targetFund: Partial<Fund>, originalRows: RowDataProp[]) => {
            const bsnOptions = duplicateBsnRows.map((row) => ({
                _uid: row._uid,
                label: row.bsn,
                value: row.bsn,
                columns: [targetFund.name],
            }));

            const bsnOptionIds = bsnOptions.map((opt) => opt._uid);

            return new Promise<RowDataProp[] | 'canceled'>((resolve) => {
                if (bsnOptions.length === 0) {
                    return resolve(originalRows);
                }

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={`Dubbele bsn(s) gedetecteerd voor "${targetFund.name}".`}
                        hero_subtitle={[
                            `Weet u zeker dat u voor ${bsnOptions.length} bsn(s) een extra tegoed wilt aanmaken?`,
                            'Deze bsn(s) bezitten al een tegoed van dit fonds.',
                        ]}
                        enableToggles={true}
                        button_none={'Alle overslaan'}
                        button_all={'Alle aanmaken'}
                        label_on={'Aanmaken'}
                        label_off={'Overslaan'}
                        items={bsnOptions}
                        onConfirm={(data) => {
                            resolve(pickSelectedOrUnflagged(originalRows, data.uids, bsnOptionIds));
                        }}
                        onCancel={() => {
                            window.setTimeout(() => setHideModal(false), 300);
                            resolve('canceled');
                        }}
                    />
                ));
            });
        },
        [openModal, pickSelectedOrUnflagged],
    );

    const findDuplicates = useCallback(
        async (fund: Partial<Fund>, list: Array<RowDataProp>) => {
            pushSuccess(
                'Wordt verwerkt...',
                `Bestaande tegoeden voor "${fund.name}" worden verwerkt om te controleren op dubbelingen.`,
                { icon: 'download-outline' },
            );

            const fetchVouchers = (page: number) => {
                return voucherService.index(organization.id, {
                    fund_id: fund.id,
                    type: type,
                    per_page: 100,
                    page: page,
                    source: 'employee',
                    expired: 0,
                });
            };

            try {
                setProgress(0);
                const data = await helperService.recursiveLeach<SponsorVoucher>(fetchVouchers, 4);
                setProgress(100);

                pushSuccess(
                    'Aan het vergelijken...',
                    `De tegoeden voor "${fund.name}" zijn ingeladen en worden vergeleken met het .csv bestand...`,
                    { icon: 'timer-sand' },
                );

                const emails = data.map((voucher) => voucher.identity_email);
                const bsnList = [
                    ...data.map((voucher) => voucher.relation_bsn),
                    ...data.map((voucher) => voucher.identity_bsn),
                ];

                const existingEmails = list.filter((row) => emails.includes(row.email));
                const existingBsn = list.filter((csvRow) => bsnList.includes(csvRow.bsn));

                if (existingEmails.length === 0 && existingBsn.length === 0) {
                    return list;
                }

                const listFromEmails = await confirmDuplicateEmails(existingEmails, fund, list);

                const listFromBsn =
                    listFromEmails !== 'canceled'
                        ? await confirmDuplicateBsnEntries(existingBsn, fund, listFromEmails)
                        : null;

                if (listFromEmails === 'canceled' || listFromBsn === 'canceled') {
                    return 'canceled';
                }

                return listFromBsn;
            } catch (e) {
                pushDanger('Error', 'Er is iets misgegaan bij het ophalen van de tegoeden.');
                setProgress(100);
                closeModal();
                throw e;
            }
        },
        [
            closeModal,
            confirmDuplicateBsnEntries,
            confirmDuplicateEmails,
            helperService,
            organization.id,
            pushDanger,
            pushSuccess,
            setProgress,
            type,
            voucherService,
        ],
    );

    const checkLowAmounts = useCallback(
        async (fund: Partial<Fund>, list: Array<RowDataProp>) => {
            const lowAmounts = list.filter((row) => parseFloat(row.amount?.toString()) <= 5);

            return lowAmounts.length === 0 ? list : await confirmLowAmountEntries(lowAmounts, fund, list);
        },
        [confirmLowAmountEntries],
    );

    const validateCsvData = useCallback(
        (data: Array<RowDataProp>) => {
            const invalidFundIds = data
                .filter((row) => {
                    const validFormat = row.fund_id && /^\d+$/.test(row.fund_id?.toString());
                    const validFund = availableFundsIds.includes(parseInt(row.fund_id?.toString()));

                    return !validFormat || !validFund;
                })
                .map((row) => row.fund_id);

            setCsvErrors({
                ...csvErrors,
                hasInvalidFundIds: invalidFundIds.length > 0,
                hasInvalidFundIdsList: uniq(invalidFundIds).join(', '),
            });

            if (invalidFundIds.length > 0) {
                return false;
            }

            if (!organization.bsn_enabled && data.filter((row) => row.bsn).length > 0) {
                setCsvErrors({
                    ...csvErrors,
                    csvHasBsnWhileNotAllowed: true,
                });
                return false;
            }

            if (type == 'fund_voucher') {
                return validateCsvDataBudget(data);
            } else if (type == 'product_voucher') {
                return validateCsvDataProduct(data);
            }

            return false;
        },
        [availableFundsIds, csvErrors, organization.bsn_enabled, type, validateCsvDataBudget, validateCsvDataProduct],
    );

    const transformCsvData = useCallback((rawData: Array<Array<string>>) => {
        const header = rawData[0];

        const recordIndexes = header.reduce((list: Array<number>, row: string, index: number) => {
            return row.startsWith('record.') ? [...list, index] : list;
        }, []);

        const body = rawData
            .slice(1)
            .filter((row: Array<string>) => {
                return row.filter((col) => !isEmpty(col)).length > 0;
            })
            .map((row: Array<string>): Array<RowDataProp> => {
                const records = recordIndexes.reduce((list: RowDataProp, index: number) => {
                    return { ...list, [header[index].slice('record.'.length)]: row[index] as RowDataProp };
                }, {});

                const values = row.reduce((list, item, key) => {
                    return recordIndexes.includes(key) ? list : [...list, item];
                }, []);

                return [...values, records];
            });

        return [
            [...header.filter((value: string, index: number) => value && !recordIndexes.includes(index)), 'records'],
            ...body,
        ];
    }, []);

    const defaultNote = useCallback(
        (row: RowDataProp) => {
            return translate('vouchers.csv.default_note' + (row.email ? '' : '_no_email'), {
                upload_date: dateFormat(new Date()),
                uploader_email: authIdentity?.email || authIdentity?.address,
                target_email: row.email || null,
            });
        },
        [authIdentity?.address, authIdentity?.email, translate],
    );

    const showInvalidRows = useCallback(
        (errors = {}, vouchers = []): Promise<boolean> => {
            const items = Object.keys(errors)
                .map(function (key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const index = parseInt(keyDataId, 10) + 1;

                    return [index, errors[key], vouchers[keyDataId]];
                })
                .sort((a, b) => a[0] - b[0]);

            const uniqueRows = items.reduce((arr, item) => {
                return arr.includes(item[0]) ? arr : [...arr, item[0]];
            }, []);

            const message = [
                `${uniqueRows.length} van ${vouchers.length}`,
                `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                `bekijk het bestand bij welke rij(en) het mis gaat.`,
            ].join(' ');

            pushDanger('Waarschuwing', message);

            setHideModal(true);

            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={'Er zijn fouten opgetreden bij het importeren van de tegoeden'}
                        hero_subtitle={message}
                        enableToggles={false}
                        label_on={'Aanmaken'}
                        label_off={'Overslaan'}
                        items={items.map((item) => ({
                            _uid: uniqueId('rand_'),
                            label: `Rij: ${item[0]}: ${item[2]['email'] || item[2]['bsn'] || ''} - ${item[1]}`,
                            value: `Rij: ${item[0]}: ${item[2]['email'] || item[2]['bsn'] || ''} - ${item[1]}`,
                        }))}
                        onConfirm={() =>
                            window.setTimeout(() => {
                                setHideModal(false);
                                resolve(true);
                            }, 300)
                        }
                        onCancel={() =>
                            window.setTimeout(() => {
                                setHideModal(false);
                                resolve(true);
                            }, 300)
                        }
                    />
                ));
            });
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

            results.data = results.data.filter((item) => !!item);

            const csvData = transformCsvData(results.data);
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

                    row._uid = uniqueId('row_');
                    row.note = row.note || defaultNote(row);
                    row.fund_id = row.fund_id || fund.id;
                    row.client_uid = row.client_uid || row.activation_code_uid || null;
                    delete row.activation_code_uid;

                    return isEmpty(row) ? null : row;
                })
                .filter((row) => !!row);

            setCsvIsValid(validateCsvData(data));
            setData(data);
            setCsvFile(file);
            setCsvProgress(1);
        },
        [defaultNote, fund.id, parseCsvFile, reset, transformCsvData, validateCsvData],
    );

    const startUploadingData = useCallback(
        (
            fund: Partial<Fund>,
            groupData: Array<RowDataProp>,
            onChunk: (data: Array<RowDataProp>) => void,
        ): Promise<boolean> => {
            return new Promise((resolve) => {
                const submitData = chunk(groupData, dataChunkSize);
                const chunksCount = submitData.length;
                let currentChunkNth = 0;

                const uploadChunk = async (data: Array<RowDataProp>) => {
                    setChanged(true);

                    voucherService
                        .storeCollection(organization.id, fund.id, data, {
                            name: csvFile.name,
                            content: await fileToText(csvFile),
                            total: groupData.length,
                            chunk: currentChunkNth,
                            chunks: chunksCount,
                            chunkSize: dataChunkSize,
                        })
                        .then(() => {
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
                            setCsvProgress(1);
                            resolve(false);
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
        [csvFile, dataChunkSize, organization.id, pushDanger, voucherService],
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
                    voucherService
                        .storeCollectionValidate(organization.id, fund.id, data)
                        .then(() => {
                            currentChunkNth++;
                            onChunk(data);
                            resolveIfFinished();
                        })
                        .catch((res: ResponseError) => {
                            if (res.status == 422 && res.data.errors) {
                                Object.keys(res.data.errors).forEach(function (key) {
                                    const keyData = key.split('.');
                                    keyData[1] = (
                                        parseInt(keyData[1], 10) +
                                        currentChunkNth * dataChunkSize
                                    ).toString();
                                    errors[keyData.join('.')] = res.data.errors[key];
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
        [dataChunkSize, organization.id, voucherService],
    );

    const startUploading = useCallback(
        async (data: Array<RowDataProp>, validation = false): Promise<boolean> => {
            setCsvProgress(2);

            const dataGrouped = groupBy<RowDataProp>(
                data.map((row) => ({ ...row, fund_id: row.fund_id ? row.fund_id : fund.id })),
                'fund_id',
            );

            const dataGroupedKeys = Object.keys(dataGrouped);

            for (let i = 0; i < dataGroupedKeys.length; i++) {
                const fundId = dataGroupedKeys[i];
                const fund = availableFundsById[fundId];
                const items = dataGrouped[fund.id].map((item) => {
                    delete item.fund_id;
                    return item;
                });

                const totalRows = items.length;
                let uploadedRows = 0;

                setLoadingBarProgress(0, getStatus(fund, validation));

                if (validation) {
                    const valid = await startValidationUploadingData(fund, items, (list) => {
                        uploadedRows += list.length;
                        setLoadingBarProgress((uploadedRows / totalRows) * 100, getStatus(fund, true));
                    })
                        .then(() => {
                            setLoadingBarProgress(100, getStatus(fund, true));
                            return true;
                        })
                        .catch(async (err: ResponseError) => {
                            window.setTimeout(() => {
                                setCsvProgress(1);
                                setLoadingBarProgress(0);
                            }, 0);

                            await showInvalidRows(err, items);
                            return false;
                        });

                    if (!valid) {
                        return false;
                    }

                    continue;
                }

                const uploadValid = await startUploadingData(fund, items, (chunkData) => {
                    uploadedRows += chunkData.length;
                    setLoadingBarProgress((uploadedRows / totalRows) * 100, getStatus(fund, false));

                    if (uploadedRows === totalRows) {
                        window.setTimeout(() => {
                            setLoadingBarProgress(100, getStatus(fund, false));
                        }, 0);
                    }
                });

                if (!uploadValid) {
                    return false;
                }
            }

            setCsvProgress(3);
            return true;
        },
        [
            availableFundsById,
            fund.id,
            getStatus,
            setLoadingBarProgress,
            showInvalidRows,
            startUploadingData,
            startValidationUploadingData,
        ],
    );

    const uploadToServer = useCallback(async () => {
        if (!csvIsValid) {
            return false;
        }

        setLoading(true);

        const listByFundId = groupBy(data, 'fund_id');
        const listSelected: Array<RowDataProp> = [];

        const list = Object.keys(listByFundId).map((fund_id) => ({
            list: listByFundId[fund_id],
            fund: availableFundsById[fund_id],
        }));

        setHideModal(true);

        try {
            for (let i = 0; i < list.length; i++) {
                const data = await findDuplicates(list[i].fund, list[i].list);
                const data2 = data === 'canceled' ? data : await checkLowAmounts(list[i].fund, data);

                if (data2 === 'canceled') {
                    pushSuccess('CSV upload is geannuleerd', 'Er zijn geen gegevens geselecteerd.');
                    setLoadingBarProgress(0);
                    setHideModal(false);
                    setLoading(false);
                    return;
                } else {
                    listSelected.push(...data2);
                }
            }

            setHideModal(false);

            if (listSelected.length > 0) {
                if (await startUploading(listSelected, true)) {
                    await startUploading(listSelected, false);
                }
            } else {
                pushDanger('CSV upload is geannuleerd', 'Er zijn geen gegevens geselecteerd.');
            }
        } catch {
            pushDanger('CSV upload is geannuleerd', 'Er zijn geen gegevens geselecteerd.');
        }

        setLoadingBarProgress(0);
        setHideModal(false);
        setLoading(false);
    }, [
        availableFundsById,
        checkLowAmounts,
        csvIsValid,
        data,
        findDuplicates,
        pushDanger,
        pushSuccess,
        setLoadingBarProgress,
        startUploading,
    ]);

    const onDragEvent = useCallback((e: React.DragEvent, isDragOver: boolean) => {
        e?.preventDefault();
        e?.stopPropagation();

        setIsDragOver(isDragOver);
    }, []);

    const fetchProducts = useCallback(() => {
        if (type != 'product_voucher') {
            return;
        }

        helperService
            .recursiveLeach((page: number) => productService.listAll({ page, fund_id: fund.id, per_page: 1000 }), 4)
            .then((data: Array<Product>) => setProducts(sortBy(data, 'id')));
    }, [fund.id, helperService, productService, type]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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

                            <div className="form-group">
                                <div className="form-label">
                                    {translate('modals.modal_voucher_create.labels.credit_type')}
                                </div>

                                <FormGroupInfo info={<TranslateHtml i18n={'csv_upload.tooltips.type'} />}>
                                    <SelectControl
                                        value={type}
                                        propKey={'key'}
                                        onChange={(type: 'fund_voucher' | 'product_voucher') => setType(type)}
                                        options={types}
                                        allowSearch={false}
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

                                        {!csvIsValid && type == 'fund_voucher' && (
                                            <div className="text-left">
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
                                                {csvErrors.csvProductIdPresent && (
                                                    <div className="form-error">
                                                        De kolom `product_id` mag niet in het bestand zitten.
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
                                            </div>
                                        )}

                                        {!csvIsValid && type == 'product_voucher' && (
                                            <div className="text-left">
                                                {csvErrors.csvHasBsnWhileNotAllowed && (
                                                    <div className="form-error">
                                                        BSN field is present while BSN is not enabled for the
                                                        organization
                                                    </div>
                                                )}
                                                {csvErrors.csvHasMissingProductId && (
                                                    <div className="form-error">
                                                        De kolom `product_id` mist in het bestand.
                                                    </div>
                                                )}
                                                {csvErrors.hasAmountField && (
                                                    <div className="form-error">
                                                        De kolom `amount` mag niet in het bestand zitten.
                                                    </div>
                                                )}
                                                {csvErrors.csvProductsInvalidUnknownIds?.length > 0 && (
                                                    <div className="form-error">
                                                        De kolom `product_id` in het bulkbestand bevat verkeerde product
                                                        identificatienummers
                                                        {` '${csvErrors.csvProductsInvalidUnknownIdsList}'`}. De nummers
                                                        van deze producten zijn incorrect of de producten zijn
                                                        uitverkocht.
                                                    </div>
                                                )}
                                                {csvErrors.csvProductsInvalidStockIds?.length > 0 && (
                                                    <div className="form-error">
                                                        De kolom `product_id` in het bulkbestand bevat
                                                        identificatienummers
                                                        {` '${csvErrors.csvProductsInvalidStockIdsList}'`}. van aanbod
                                                        aanbod dat uitverkocht is.
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
