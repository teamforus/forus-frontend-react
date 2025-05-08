import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FundRequestTotals, useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import { useNavigate } from 'react-router';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import FundRequest from '../../../props/models/FundRequest';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import { useEmployeeService } from '../../../services/EmployeeService';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import { format } from 'date-fns';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import 'react-datepicker/dist/react-datepicker.css';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { PaginationData } from '../../../props/ApiResponses';
import ModalExportTypeLegacy from '../../modals/ModalExportTypeLegacy';
import { useFileService } from '../../../services/FileService';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useSetProgress from '../../../hooks/useSetProgress';
import { dateFormat, dateParse } from '../../../helpers/dates';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import FundRequestsTable from './elements/FundRequestsTable';
import { NumberParam, StringParam } from 'use-query-params';

export default function FundRequests() {
    const envData = useEnvData();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const activeOrganization = useActiveOrganization();

    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [employees, setEmployees] = useState(null);
    const [fundRequests, setFundRequests] = useState<PaginationData<FundRequest, { totals: FundRequestTotals }>>(null);

    const fileService = useFileService();
    const employeeService = useEmployeeService();
    const paginatorService = usePaginatorService();
    const fundRequestService = useFundRequestValidatorService();

    const [paginatorKey] = useState('fund_requests');

    const [allEmployeesOption] = useState({
        id: null,
        email: 'Alle medewerker',
    });

    const [states] = useState([
        { key: null, name: 'Alle' },
        { key: 'approved', name: 'Geaccepteerd' },
        { key: 'disregarded', name: 'Buiten behandeling geplaatst' },
        { key: 'declined', name: 'Geweigerd' },
        { key: 'pending', name: 'Wachtend' },
    ]);

    const [assignedOptions] = useState([
        { key: null, name: 'Alle' },
        { key: 1, name: 'Toegewezen' },
        { key: 0, name: 'Niet toegewezen' },
    ]);

    const totals = useMemo(() => {
        return fundRequests?.meta?.totals;
    }, [fundRequests]);

    const stateGroups = useMemo<Array<{ key: string; label: string }>>(
        () => [
            { key: 'all', label: translate('validation_requests.tabs.all', { total: totals?.all }) },
            { key: 'pending', label: translate('validation_requests.tabs.pending', { total: totals?.pending }) },
            { key: 'assigned', label: translate('validation_requests.tabs.assigned', { total: totals?.assigned }) },
            { key: 'resolved', label: translate('validation_requests.tabs.resolved', { total: totals?.resolved }) },
        ],
        [totals, translate],
    );

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q?: string;
        page?: number;
        per_page?: number;
        state_group?: string;
        state?: string;
        employee_id?: number;
        assigned: number;
        from: string;
        to: string;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey),
            state_group: stateGroups[0].key,
            state: states[0].key,
            employee_id: null,
            assigned: null,
            from: null,
            to: null,
            order_by: 'state',
            order_dir: 'asc',
        },
        {
            queryParamsRemoveDefault: true,
            queryParams: {
                q: StringParam,
                page: NumberParam,
                per_page: NumberParam,
                state_group: StringParam,
                state: StringParam,
                employee_id: NumberParam,
                assigned: NumberParam,
                from: StringParam,
                to: StringParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const fetchFundRequests = useCallback(() => {
        setProgress(0);
        setLoading(true);

        fundRequestService
            .index(activeOrganization.id, filterActiveValues)
            .then((res) => setFundRequests(res.data))
            .catch(pushApiError)
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [setProgress, fundRequestService, activeOrganization.id, filterActiveValues, pushApiError]);

    const fetchEmployees = useCallback(() => {
        setProgress(0);

        employeeService
            .list(activeOrganization.id, { per_page: 100, permission: 'validate_records' })
            .then((res) => setEmployees({ data: [allEmployeesOption, ...res.data.data], meta: res.data.meta }))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, activeOrganization.id, employeeService, allEmployeesOption, pushApiError]);

    const doExport = useCallback(
        (exportType: string) => {
            fundRequestService
                .export(activeOrganization.id, { ...filterActiveValues, export_type: exportType })
                .then((res) => {
                    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    const fileType = res.headers['content-type'] + ';charset=utf-8;';
                    const fileName = `${envData.client_type}_${activeOrganization.name}_fund-requests_${dateTime}.${exportType}`;

                    fileService.downloadFile(fileName, res.data, fileType);
                })
                .catch(pushApiError);
        },
        [fundRequestService, activeOrganization, filterActiveValues, envData.client_type, fileService, pushApiError],
    );

    const exportRequests = useCallback(() => {
        openModal((modal) => <ModalExportTypeLegacy modal={modal} onSubmit={(exportType) => doExport(exportType)} />);
    }, [doExport, openModal]);

    useEffect(() => {
        if (!appConfigs.organizations?.funds?.fund_requests) {
            navigate(getStateRouteUrl('organizations'));
        }
    }, [appConfigs.organizations?.funds?.fund_requests, navigate]);

    useEffect(() => fetchEmployees(), [fetchEmployees]);

    useEffect(() => {
        fetchFundRequests();
    }, [fetchFundRequests]);

    if (!fundRequests) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="fundRequestsPageContent">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('validation_requests.header.title')} ({fundRequests.meta.total})
                </div>

                <div className="card-header-filters form">
                    <div className="block block-label-tabs">
                        <div className="label-tab-set">
                            {stateGroups?.map((stateGroup) => (
                                <div
                                    key={stateGroup.key}
                                    onClick={() => filterUpdate({ state_group: stateGroup.key })}
                                    data-dusk={`fundRequestsStateTab_${stateGroup.key}`}
                                    className={`label-tab label-tab-sm ${
                                        filterValues.state_group === stateGroup.key ? 'active' : ''
                                    }`}>
                                    {stateGroup.label} ({fundRequests.meta.totals[stateGroup.key]})
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="block block-inline-filters">
                        {filter.show && (
                            <button
                                className="button button-text"
                                onClick={() => {
                                    filter.resetFilters();
                                    filter.setShow(false);
                                }}>
                                <em className="mdi mdi-close icon-start" />
                                {translate('validation_requests.buttons.clear_filter')}
                            </button>
                        )}

                        {!filter.show && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        data-dusk="searchFundRequests"
                                        value={filter.values.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('validation_requests.labels.search')}
                                    />
                                </div>
                            </div>
                        )}

                        <CardHeaderFilter filter={filter}>
                            <FilterItemToggle show={true} label={translate('validation_requests.labels.search')}>
                                <input
                                    type="text"
                                    value={filter.values?.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder={translate('validation_requests.labels.search')}
                                    className="form-control"
                                />
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('validation_requests.labels.state')}>
                                <SelectControl
                                    className={'form-control'}
                                    options={states}
                                    propKey={'key'}
                                    allowSearch={false}
                                    onChange={(state: string) => filterUpdate({ state })}
                                />
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('validation_requests.labels.assignee_state')}>
                                <SelectControl
                                    className={'form-control'}
                                    options={assignedOptions}
                                    propKey={'key'}
                                    allowSearch={false}
                                    onChange={(assigned: number | null) => filterUpdate({ assigned })}
                                />
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('validation_requests.labels.assigned_to')}>
                                {employees && (
                                    <SelectControl
                                        className={'form-control'}
                                        options={employees.data}
                                        propKey={'id'}
                                        propValue={'email'}
                                        allowSearch={false}
                                        onChange={(employee_id: number | null) => filterUpdate({ employee_id })}
                                    />
                                )}
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('validation_requests.labels.from')}>
                                <DatePickerControl
                                    placeholder={'yyyy-MM-dd'}
                                    value={dateParse(filter.values.from?.toString())}
                                    onChange={(date) => filterUpdate({ from: dateFormat(date) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('validation_requests.labels.to')}>
                                <DatePickerControl
                                    placeholder={'yyyy-MM-dd'}
                                    value={dateParse(filter.values.to)}
                                    onChange={(date: Date) => filterUpdate({ to: dateFormat(date) })}
                                />
                            </FilterItemToggle>
                            <div className="form-actions">
                                {fundRequests && (
                                    <button
                                        className="button button-primary button-wide"
                                        disabled={fundRequests.meta.total == 0}
                                        onClick={() => exportRequests()}>
                                        <em className="mdi mdi-download icon-start" />
                                        {translate('components.dropdown.export', {
                                            total: fundRequests.meta.total,
                                        })}
                                    </button>
                                )}
                            </div>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            <FundRequestsTable
                filter={filter}
                loading={loading}
                paginatorKey={paginatorKey}
                organization={activeOrganization}
                fundRequests={fundRequests}
                filterUpdate={filterUpdate}
                filterValues={filterValues}
            />
        </div>
    );
}
