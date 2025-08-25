import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RecordType from '../../../props/models/RecordType';
import useTranslate from '../../../hooks/useTranslate';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import useSetProgress from '../../../hooks/useSetProgress';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useEmployeeService } from '../../../services/EmployeeService';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import { usePrevalidationService } from '../../../services/PrevalidationService';
import Employee from '../../../props/models/Employee';
import { PaginationData } from '../../../props/ApiResponses';
import Prevalidation from '../../../props/models/Prevalidation';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import ModalNotification from '../../modals/ModalNotification';
import ModalCreatePrevalidation from '../../modals/ModalCreatePrevalidation';
import ModalPrevalidationsUpload from '../../modals/ModalPrevalidationsUpload';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import { strLimit } from '../../../helpers/string';
import TableRowActions from '../../elements/tables/TableRowActions';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import Paginator from '../../../modules/paginator/components/Paginator';
import { NumberParam, StringParam } from 'use-query-params';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import usePrevalidationExporter from '../../../services/exporters/usePrevalidationExporter';
import Label from '../../elements/image_cropper/Label';
import { uniq } from 'lodash';

export default function Prevalidations() {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const employeeService = useEmployeeService();
    const paginatorService = usePaginatorService();
    const recordTypeService = useRecordTypeService();
    const prevalidationService = usePrevalidationService();

    const prevalidationExporter = usePrevalidationExporter();

    const [funds, setFunds] = useState<Array<Fund>>([]);
    const [paginatorKey] = useState('products');
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);

    const [employees, setEmployees] = useState<Array<Employee>>(null);
    const [prevalidations, setPrevalidations] = useState<PaginationData<Prevalidation>>(null);

    const typesByKey = useMemo(() => {
        return recordTypes?.reduce((list, element) => ({ ...list, [element.key]: element.name }), {});
    }, [recordTypes]);

    const employeesByAddress = useMemo(() => {
        return employees?.reduce((list, employee) => ({ ...list, [employee?.identity_address]: employee?.email }), []);
    }, [employees]);

    const [states] = useState([
        { key: null, name: 'Alle' },
        { key: 'used', name: 'Ja' },
        { key: 'pending', name: 'Nee' },
    ]);

    const [statesExported] = useState([
        { key: null, name: 'Alle' },
        { key: 1, name: 'Ja' },
        { key: 0, name: 'Nee' },
    ]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q?: string;
        to?: string;
        from?: string;
        state?: string;
        fund_id?: number;
        exported?: number;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            fund_id: null,
            state: states[0].key,
            exported: statesExported[0].key,
            from: null,
            to: null,
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey, 10),
        },
        {
            queryParams: {
                q: StringParam,
                fund_id: NumberParam,
                state: StringParam,
                exported: NumberParam,
                from: StringParam,
                to: StringParam,
                per_page: NumberParam,
                page: NumberParam,
            },
        },
    );

    const headers = useMemo(() => {
        const headers: string[] = prevalidations?.data
            ?.reduce((headers, prevalidation) => {
                return prevalidation.records
                    ?.map((record) => record.key)
                    .filter((key) => !headers.includes(key))
                    .concat(headers);
            }, [])
            ?.filter((header: string) => !header?.endsWith('_hash'))
            ?.sort();

        const primaryKeys = uniq(funds.map((fund) => fund.csv_primary_key).filter((key) => key));

        for (const key of primaryKeys) {
            const primaryKey = headers?.indexOf(key);

            if (primaryKey !== -1) {
                headers?.splice(primaryKey, 1);
                headers?.unshift(key);
            }
        }

        return headers;
    }, [funds, prevalidations]);

    const rows = useMemo(() => {
        return prevalidations?.data?.map((prevalidation) => ({
            ...prevalidation,
            records: headers?.map((header) => {
                return prevalidation.records?.find((record) => record.key == header) || null;
            }),
        }));
    }, [headers, prevalidations?.data]);

    const { headElement, configsElement } = useConfigurableTable(
        prevalidationService.getColumns(headers || [], typesByKey),
    );

    const exportData = useCallback(() => {
        prevalidationExporter.exportData(activeOrganization.id, { ...filterValuesActive, ...filter.activeValues });
    }, [activeOrganization.id, filterValuesActive, filter.activeValues, prevalidationExporter]);

    const fetchPrevalidations = useCallback(() => {
        setProgress(0);

        prevalidationService
            .list(activeOrganization.id, { ...filterValuesActive })
            .then((res) => setPrevalidations(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, prevalidationService, filterValuesActive, activeOrganization.id]);

    const fetchEmployees = useCallback(() => {
        setProgress(0);

        employeeService
            .list(activeOrganization.id, { per_page: 1000 })
            .then((res) => setEmployees(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, activeOrganization.id, employeeService]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization?.id, { state: 'active_paused_and_closed', per_page: 100 })
            .then((res) => {
                setFunds(res.data.data.filter((fund) => hasPermission(fund.organization, 'validate_records')));
            })
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization?.id]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    const deletePrevalidation = useCallback(
        (prevalidation: Prevalidation) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    className={'modal-md'}
                    title={'Wilt u dit gegeven verwijderen?'}
                    description={
                        'Weet u zeker dat u dit gegeven wilt verwijderen? Deze actie kunt niet ongedaan maken, ' +
                        'u kunt echter wel een nieuw gegeven aanmaken.'
                    }
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();

                            prevalidationService
                                .destroy(prevalidation.fund.organization_id, prevalidation.uid)
                                .then(() => {
                                    pushSuccess('Gegeven verwijderd');
                                    fetchPrevalidations();
                                });
                        },
                    }}
                    buttonCancel={{ onClick: () => modal.close() }}
                />
            ));
        },
        [fetchPrevalidations, openModal, prevalidationService, pushSuccess],
    );

    const createPrevalidation = useCallback(
        (funds: Array<Fund>, fundId: number, onCreate?: () => void) => {
            openModal((modal) => (
                <ModalCreatePrevalidation
                    modal={modal}
                    funds={funds}
                    fundId={fundId}
                    recordTypes={recordTypes}
                    onCreated={() => onCreate?.()}
                />
            ));
        },
        [openModal, recordTypes],
    );

    const uploadPrevalidations = useCallback(
        (funds: Array<Fund>, fundId: number, onCreate?: () => void) => {
            openModal((modal) => (
                <ModalPrevalidationsUpload
                    modal={modal}
                    recordTypes={recordTypes}
                    funds={funds}
                    fundId={fundId}
                    onCompleted={onCreate}
                />
            ));
        },
        [openModal, recordTypes],
    );

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchPrevalidations();
    }, [fetchPrevalidations]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    if (funds?.length === 0) {
        return <EmptyCard title={'Geen fondsen gevonden'} />;
    }

    if (!prevalidations) {
        return <LoadingCard />;
    }

    return (
        <div className="card form" data-dusk="tablePrevalidationContent">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('prevalidated_table.header.title')} ({prevalidations?.meta?.total})
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <button
                            id="create_voucher"
                            className="button button-primary"
                            data-dusk="createPrevalidationButton"
                            onClick={() =>
                                createPrevalidation(funds, filterValuesActive?.fund_id, fetchPrevalidations)
                            }>
                            <em className="mdi mdi-plus-circle icon-start" />
                            {translate('csv_validation.buttons.create')}
                        </button>

                        <button
                            id="prevalidations_upload_csv"
                            className="button button-primary"
                            data-dusk="uploadPrevalidationsBatchButton"
                            onClick={() =>
                                uploadPrevalidations(funds, filterValuesActive?.fund_id, fetchPrevalidations)
                            }>
                            <em className="mdi mdi-upload icon-start" />
                            {translate('csv_validation.buttons.upload')}
                        </button>

                        <div className="form-group">
                            <SelectControl
                                className="form-control inline-filter-control"
                                propKey={'id'}
                                options={[{ id: null, name: 'Selecteer fonds' }, ...funds]}
                                value={filter.activeValues.fund_id}
                                placeholder={translate('vouchers.labels.fund')}
                                allowSearch={false}
                                onChange={(fund_id: number) => filter.update({ fund_id })}
                                optionsComponent={SelectControlOptionsFund}
                                dusk="prevalidationsSelectFund"
                            />
                        </div>

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
                                        data-dusk="tablePrevalidationSearch"
                                        placeholder={translate('prevalidated_table.labels.search')}
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
                                                label={translate('prevalidated_table.labels.search')}
                                                show={true}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={filter.values.q}
                                                    placeholder={translate('event_logs.labels.search')}
                                                    onChange={(e) => filter.update({ q: e.target.value })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('prevalidated_table.labels.active')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={true}
                                                    options={states}
                                                    onChange={(state: string) => filter.update({ state })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('prevalidated_table.labels.exported')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={true}
                                                    options={statesExported}
                                                    onChange={(exported: number) => filter.update({ exported })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('prevalidated_table.labels.from')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.from)}
                                                    dateFormat="dd-MM-yyyy"
                                                    placeholder={'dd-MM-jjjj'}
                                                    onChange={(from: Date) => filter.update({ from: dateFormat(from) })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('prevalidated_table.labels.to')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.to)}
                                                    dateFormat="dd-MM-yyyy"
                                                    placeholder={'dd-MM-jjjj'}
                                                    onChange={(to: Date) => filter.update({ to: dateFormat(to) })}
                                                />
                                            </FilterItemToggle>

                                            <div className="form-actions">
                                                <button
                                                    className="button button-primary button-wide"
                                                    onClick={() => exportData()}
                                                    data-dusk="export"
                                                    disabled={prevalidations?.meta.total == 0}>
                                                    <em className="mdi mdi-download icon-start" />
                                                    {translate('components.dropdown.export', {
                                                        total: prevalidations.meta.total,
                                                    })}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="button button-default button-icon"
                                    data-dusk="showFilters"
                                    onClick={() => filter.setShow(!filter.show)}>
                                    <em className="mdi mdi-filter-outline" />
                                </button>
                            </ClickOutside>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!prevalidations.meta}
                empty={prevalidations.meta.total == 0}
                emptyTitle={'Geen aanvragers toevoegen'}
                emptyDescription={
                    'U bent geen beoordelaar voor een fonds dat actief is om aanvragers aan toe te voegen.'
                }>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {rows?.map((row) => (
                                        <tr key={row.id} data-dusk={`tablePrevalidationRow${row.id}`}>
                                            <td className="text-primary text-strong">{row.uid}</td>

                                            <td>
                                                <div className="text-primary text-semibold">
                                                    {row.fund ? strLimit(row.fund?.name, 32) : <TableEmptyValue />}
                                                </div>

                                                <div className="text-strong text-md text-muted-dark">
                                                    {row.fund ? (
                                                        strLimit(row.fund?.implementation?.name, 32)
                                                    ) : (
                                                        <TableEmptyValue />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-primary text-strong">
                                                {employeesByAddress?.[row?.identity_address] || 'Unknown'}
                                            </td>

                                            {row.records?.map((record, index) => (
                                                <td key={index} className={'text-left'}>
                                                    {record ? record.value : <TableEmptyValue />}
                                                </td>
                                            ))}

                                            <td>
                                                <Label type={row.state == 'pending' ? 'default' : 'success'}>
                                                    {row.state == 'pending' ? 'Nee' : 'Ja'}
                                                </Label>
                                            </td>

                                            <td>
                                                <Label type={!row.exported ? 'default' : 'success'}>
                                                    {!row.exported ? 'Nee' : 'Ja'}
                                                </Label>
                                            </td>

                                            <td className={'table-td-actions text-right'}>
                                                {row.state === 'pending' ? (
                                                    <TableRowActions
                                                        content={(e) => (
                                                            <div className="dropdown dropdown-actions">
                                                                <a
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                        deletePrevalidation(row);
                                                                        e.close();
                                                                    }}>
                                                                    Verwijderen
                                                                </a>
                                                            </div>
                                                        )}
                                                    />
                                                ) : (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {prevalidations?.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={prevalidations.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
