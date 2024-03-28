import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import RecordType from '../../../../props/models/RecordType';
import { useTranslation } from 'react-i18next';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../../elements/select-control/SelectControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import ModalExportTypeLegacy from '../../../modals/ModalExportTypeLegacy';
import useOpenModal from '../../../../hooks/useOpenModal';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import Prevalidation from '../../../../props/models/Prevalidation';
import { usePrevalidationService } from '../../../../services/PrevalidationService';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { useEmployeeService } from '../../../../services/EmployeeService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import ModalNotification from '../../../modals/ModalNotification';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { format } from 'date-fns';
import { useFileService } from '../../../../services/FileService';
import usePushDanger from '../../../../hooks/usePushDanger';
import EmptyCard from '../../../elements/empty-card/EmptyCard';

export default function PrevalidatedTable({ fund, recordTypes = [] }: { fund: Fund; recordTypes: Array<RecordType> }) {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const fileService = useFileService();
    const employeeService = useEmployeeService();
    const paginatorService = usePaginatorService();
    const prevalidationService = usePrevalidationService();

    const [paginatorKey] = useState('products');
    const [headers, setHeaders] = useState<Array<string>>(null);
    const [rows, setRows] = useState<Array<Prevalidation>>(null);
    const [employeesList, setEmployeesList] = useState<Array<string>>([]);
    const [typesByKey, setTypesByKey] = useState<{ [key: string]: string }>({});
    const [prevalidations, setPrevalidations] = useState<PaginationData<Prevalidation>>(null);

    const states = useMemo(() => {
        return [
            {
                key: null,
                name: 'Alle',
            },
            {
                key: 'used',
                name: 'Ja',
            },
            {
                key: 'pending',
                name: 'Nee',
            },
        ];
    }, []);

    const statesExported = useMemo(() => {
        return [
            {
                key: null,
                name: 'Alle',
            },
            {
                key: 1,
                name: 'Ja',
            },
            {
                key: 0,
                name: 'Nee',
            },
        ];
    }, []);

    const filter = useFilter({
        q: '',
        fund_id: fund ? fund.id : null,
        state: states[0].key,
        exported: statesExported[0].key,
        from: null,
        to: null,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const doExport = useCallback(
        (exportType: string) => {
            prevalidationService.export({ ...filter.activeValues, export_type: exportType }).then(
                (res) => {
                    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    const fileType = res.headers['content-type'] + ';charset=utf-8;';
                    const fileName = `${fund.key || 'fund'}_${dateTime}.${exportType}`;

                    fileService.downloadFile(fileName, res.data, fileType);
                },
                (res: ResponseError) => {
                    pushDanger('Mislukt!', res.data.message);
                },
            );
        },
        [fileService, filter.activeValues, fund.key, prevalidationService, pushDanger],
    );

    const exportData = useCallback(() => {
        openModal((modal) => (
            <ModalExportTypeLegacy
                modal={modal}
                onSubmit={(exportType) => {
                    doExport(exportType);
                }}
            />
        ));
    }, [doExport, openModal]);

    const deletePrevalidation = useCallback(
        (prevalidation) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={'Wilt u dit gegeven verwijderen?'}
                    description={
                        'Weet u zeker dat u dit gegeven wilt verwijderen? Deze actie kunt niet ongedaan maken, ' +
                        'u kunt echter wel een nieuw gegeven aanmaken.'
                    }
                    buttonSubmit={{
                        text: t('popup_auth.pin_code.confirmation.buttons.confirm'),
                        onClick: () => {
                            prevalidationService.destroy(prevalidation.uid).then(() => {
                                pushSuccess('Gegeven verwijderd');
                            });
                            modal.close();
                        },
                    }}
                    buttonCancel={{
                        text: t('popup_auth.pin_code.confirmation.buttons.try_again'),
                        onClick: () => modal.close(),
                    }}
                />
            ));
        },
        [openModal, prevalidationService, pushSuccess, t],
    );

    const makeHeaders = useCallback(
        (prevalidations) => {
            const headers = prevalidations
                ?.reduce((headers: string, prevalidation: { records: RecordType[] }) => {
                    return prevalidation.records
                        ?.filter((record) => headers.indexOf(record.key) === -1)
                        .map((record) => record.key)
                        .concat(headers);
                }, [])
                ?.filter((header: string) => !header?.endsWith('_hash'))
                ?.sort();

            const primaryKey = headers?.indexOf(fund.csv_primary_key);

            if (primaryKey !== -1) {
                headers?.splice(primaryKey, 1);
                headers?.unshift(fund.csv_primary_key);
            }

            return headers;
        },
        [fund.csv_primary_key],
    );

    const makeRow = useCallback((prevalidation, headers) => {
        return Object.assign(prevalidation, {
            records: headers?.map(
                (header: never) =>
                    prevalidation.records?.filter((record: RecordType) => record.key == header)[0] || false,
            ),
        });
    }, []);

    const makeRows = useCallback(
        (prevalidations, headers) => {
            return prevalidations?.map((prevalidation: never) => makeRow(prevalidation, headers));
        },
        [makeRow],
    );

    const buildTable = useCallback(
        (prevalidations) => {
            const headers = makeHeaders(prevalidations);

            setHeaders(headers);
            setRows(makeRows(prevalidations, headers));
        },
        [makeHeaders, makeRows],
    );

    const fetchPrevalidations = useCallback(() => {
        prevalidationService
            .list({
                ...filter.activeValues,
                fund_id: fund.id,
            })
            .then((res) => {
                return setPrevalidations(res.data);
            });
    }, [filter.activeValues, fund.id, prevalidationService]);

    const fetchEmployees = useCallback(() => {
        employeeService.list(activeOrganization.id, { per_page: 1000 }).then((res) => {
            setEmployeesList(
                res.data.data?.reduce((list, employee) => {
                    return { ...list, [employee?.identity_address]: employee?.email };
                }, []),
            );

            return;
        });
    }, [activeOrganization.id, employeeService]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchPrevalidations();
    }, [fetchPrevalidations]);

    useEffect(() => {
        if (prevalidations && prevalidations.data) {
            buildTable(prevalidations.data);
        }
    }, [buildTable, prevalidations]);

    useEffect(() => {
        recordTypes.forEach((element) => (typesByKey[element.key] = element.name));
        setTypesByKey(typesByKey);
    }, [recordTypes, typesByKey]);

    if (!prevalidations) {
        return <LoadingCard />;
    }

    if (prevalidations?.meta.total == 0) {
        return <EmptyCard description={'Geen gegevens van aanvragers gevonden'} />;
    }

    return (
        <Fragment>
            {prevalidations && (
                <div className="card form">
                    <div className="card-header">
                        <div className="row">
                            <div className="col col-lg-6 col-xs-12">
                                <div className="card-title">{t('prevalidated_table.header.title')}</div>
                            </div>

                            <div className="block block-inline-filters col col-lg-6 col-xs-12 text-right">
                                {filter.show && (
                                    <div className="button button-text" onClick={() => filter.resetFilters()}>
                                        <em className="mdi mdi-close icon-start" />
                                        Wis filters
                                    </div>
                                )}

                                {!filter.show && (
                                    <div className="form">
                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder={t('prevalidated_table.labels.search')}
                                                value={filter.values.q}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form inline-filters-dropdown pull-right">
                                    <ClickOutside onClickOutside={() => filter.setShow(false)}>
                                        {filter.show && (
                                            <div className="inline-filters-dropdown-content">
                                                <div className="arrow-box bg-dim">
                                                    <em className="arrow" />
                                                </div>

                                                <div className="form">
                                                    <FilterItemToggle
                                                        label={t('prevalidated_table.labels.search')}
                                                        show={true}>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={filter.values.q}
                                                            placeholder={t('event_logs.labels.search')}
                                                            onChange={(e) => filter.update({ q: e.target.value })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('prevalidated_table.status.active')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'key'}
                                                            allowSearch={true}
                                                            options={states}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(state: string) => filter.update({ state })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('prevalidated_table.labels.exported')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'key'}
                                                            allowSearch={true}
                                                            options={statesExported}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(exported: number) => filter.update({ exported })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('prevalidated_table.labels.from')}>
                                                        <DatePickerControl
                                                            value={dateParse(filter.values.from)}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholder={t('dd-MM-jjjj')}
                                                            onChange={(from: Date) => {
                                                                filter.update({ from: dateFormat(from) });
                                                            }}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('prevalidated_table.labels.to')}>
                                                        <DatePickerControl
                                                            value={dateParse(filter.values.to)}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholder={t('dd-MM-jjjj')}
                                                            onChange={(to: Date) => {
                                                                filter.update({ to: dateFormat(to) });
                                                            }}
                                                        />
                                                    </FilterItemToggle>

                                                    <div className="form-actions">
                                                        <button
                                                            className="button button-primary button-wide"
                                                            onClick={() => exportData()}
                                                            disabled={prevalidations?.meta.total == 0}>
                                                            <em className="mdi mdi-download icon-start" />
                                                            <span>
                                                                {t('components.dropdown.export', {
                                                                    total: prevalidations.meta.total,
                                                                })}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            className="button button-default button-icon"
                                            onClick={() => filter.setShow(!filter.show)}>
                                            <em className="mdi mdi-filter-outline" />
                                        </button>
                                    </ClickOutside>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper table-wrapper-scroll">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{t('prevalidated_table.labels.code')}</th>
                                            <th>{t('prevalidated_table.labels.employee')}</th>
                                            {headers?.map((headerKey, index) => (
                                                <th key={index}>{typesByKey[headerKey] || headerKey}</th>
                                            ))}
                                            <th className="text-right">{t('prevalidated_table.status.active')}</th>
                                            <th className="text-right">{t('prevalidated_table.labels.exported')}</th>
                                            <th className="text-right">{t('prevalidated_table.labels.actions')}</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows?.map((row) => (
                                            <tr key={row.id}>
                                                <td className="text-primary text-strong">{row.uid}</td>
                                                <td className="text-primary text-strong">
                                                    {employeesList[row.identity_address] || 'Unknown'}
                                                </td>
                                                {row.records?.map((record, index) => (
                                                    <td key={index}>
                                                        {record ? (
                                                            <div className="text-left">{record.value}</div>
                                                        ) : (
                                                            <div className="text-left text-muted">-</div>
                                                        )}
                                                    </td>
                                                ))}

                                                <td className="text-right">
                                                    <div
                                                        className={`tag tag-sm ${[
                                                            row.state == 'pending' ? 'tag-default' : 'tag-success',
                                                        ]}`}>
                                                        {row.state == 'pending' ? 'Nee' : 'Ja'}
                                                    </div>
                                                </td>

                                                <td className="text-right">
                                                    <div
                                                        className={`tag tag-sm ${[
                                                            !row.exported ? 'tag-default' : 'tag-success',
                                                        ]}`}>
                                                        {!row.exported ? 'Nee' : 'Ja'}
                                                    </div>
                                                </td>

                                                <td className="text-right">
                                                    {row.state === 'pending' && (
                                                        <div
                                                            className="button button-default button-icon"
                                                            onClick={() => deletePrevalidation(row)}>
                                                            <em className="mdi mdi-delete icon-start" />
                                                        </div>
                                                    )}

                                                    {row.state !== 'pending' && (
                                                        <div className="text-muted">Geen opties</div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {prevalidations?.meta && (
                        <div className="card-section">
                            <Paginator
                                meta={prevalidations.meta}
                                filters={filter.values}
                                updateFilters={filter.update}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </div>
            )}
        </Fragment>
    );
}
