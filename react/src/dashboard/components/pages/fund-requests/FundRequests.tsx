import React, { useCallback, useEffect, useState } from 'react';
import useFilter from '../../../hooks/useFilter';
import { useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import Paginator from '../../../modules/paginator/components/Paginator';
import { strLimit } from '../../../helpers/string';
import FundRequest from '../../../props/models/FundRequest';
import ThSortable from '../../elements/tables/ThSortable';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import { useEmployeeService } from '../../../services/EmployeeService';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import { format } from 'date-fns';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import 'react-datepicker/dist/react-datepicker.css';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import ModalExportTypeLegacy from '../../modals/ModalExportTypeLegacy';
import { useFileService } from '../../../services/FileService';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePushDanger from '../../../hooks/usePushDanger';
import useSetProgress from '../../../hooks/useSetProgress';
import { dateFormat, dateParse } from '../../../helpers/dates';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useTranslate from '../../../hooks/useTranslate';
import classNames from 'classnames';
import usePushApiError from '../../../hooks/usePushApiError';

export default function FundRequests() {
    const envData = useEnvData();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const activeOrganization = useActiveOrganization();

    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState(null);
    const [fundRequests, setFundRequests] = useState<PaginationData<FundRequest>>(null);

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
        { key: 'disregarded', name: 'Niet beoordeeld' },
        { key: 'declined', name: 'Geweigerd' },
        { key: 'pending', name: 'Wachtend' },
    ]);

    const [stateLabels] = useState({
        pending: { label: 'primary-variant', icon: 'circle-outline' },
        declined: { label: 'danger', icon: 'circle-off-outline' },
        approved: { label: 'success', icon: 'circle-slice-8' },
        disregarded: { label: 'default', icon: 'circle-outline' },
    });

    const [assignedOptions] = useState([
        { key: null, name: 'Alle' },
        { key: 1, name: 'Toegewezen' },
        { key: 0, name: 'Niet toegewezen' },
    ]);

    const filter = useFilter({
        q: '',
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey),
        state: states[0].key,
        employee_id: null,
        assigned: null,
        from: null,
        to: null,
        order_by: 'state',
        order_dir: 'asc',
    });

    const fetchFundRequests = useCallback(() => {
        setProgress(0);

        fundRequestService
            .index(activeOrganization.id, filter.activeValues)
            .then((res) => setFundRequests(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, activeOrganization.id, filter.activeValues, fundRequestService, pushApiError]);

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
            fundRequestService.export(activeOrganization.id, { ...filter.activeValues, export_type: exportType }).then(
                (res) => {
                    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    const fileType = res.headers['content-type'] + ';charset=utf-8;';
                    const fileName = `${envData.client_type}_${activeOrganization.name}_fund-requests_${dateTime}.${exportType}`;

                    fileService.downloadFile(fileName, res.data, fileType);
                },
                (res: ResponseError) => {
                    pushDanger('Mislukt!', res.data.message);
                },
            );
        },
        [fundRequestService, activeOrganization, filter.activeValues, envData.client_type, fileService, pushDanger],
    );

    const exportRequests = useCallback(() => {
        openModal((modal) => <ModalExportTypeLegacy modal={modal} onSubmit={(exportType) => doExport(exportType)} />);
    }, [doExport, openModal]);

    const getShowUrl = useCallback(
        (fundRequest: FundRequest) => {
            return getStateRouteUrl('fund-request', { organizationId: activeOrganization.id, id: fundRequest.id });
        },
        [activeOrganization],
    );

    useEffect(() => {
        if (!appConfigs.organizations?.funds?.fund_requests) {
            return navigate(getStateRouteUrl('organizations'));
        }
    }, [appConfigs.organizations?.funds?.fund_requests, navigate]);

    useEffect(() => fetchEmployees(), [fetchEmployees]);
    useEffect(() => fetchFundRequests(), [fetchFundRequests]);

    if (!fundRequests) {
        return <LoadingCard />;
    }

    return (
        <div className="card" data-dusk="fundRequestsPageContent">
            <div className="card-header card-header-next">
                <div className="flex flex-grow">
                    <div className="card-title">
                        {translate('validation_requests.header.title')}
                        &nbsp;
                        <span className="span-count">{fundRequests.meta.total}</span>
                    </div>
                </div>

                <div className="card-header-filters form">
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
                                        value={filter.values.q}
                                        onChange={(e) => filter.update({ q: e.target.value })}
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
                                    onChange={(e) => filter.update({ q: e.target.value })}
                                    placeholder={translate('validation_requests.labels.search')}
                                    className="form-control"
                                />
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('validation_requests.labels.status')}>
                                <SelectControl
                                    className={'form-control'}
                                    options={states}
                                    propKey={'key'}
                                    allowSearch={false}
                                    optionsComponent={SelectControlOptions}
                                    onChange={(state: string) => filter.update({ state })}
                                />
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('validation_requests.labels.assignee_state')}>
                                <SelectControl
                                    className={'form-control'}
                                    options={assignedOptions}
                                    propKey={'key'}
                                    allowSearch={false}
                                    optionsComponent={SelectControlOptions}
                                    onChange={(assigned: number | null) => filter.update({ assigned })}
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
                                        optionsComponent={SelectControlOptions}
                                        onChange={(employee_id: number | null) => filter.update({ employee_id })}
                                    />
                                )}
                            </FilterItemToggle>
                            <FilterItemToggle label={translate('validation_requests.labels.from')}>
                                <DatePickerControl
                                    placeholder={'yyyy-MM-dd'}
                                    value={dateParse(filter.values.from?.toString())}
                                    onChange={(date) => filter.update({ from: dateFormat(date) })}
                                />
                            </FilterItemToggle>

                            <FilterItemToggle label={translate('validation_requests.labels.to')}>
                                <DatePickerControl
                                    placeholder={'yyyy-MM-dd'}
                                    value={dateParse(filter.values.to)}
                                    onChange={(date: Date) => filter.update({ to: dateFormat(date) })}
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

            {fundRequests?.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <ThSortable
                                            className={'th-narrow'}
                                            filter={filter}
                                            label={translate('validation_requests.labels.id')}
                                            value={'id'}
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('validation_requests.labels.requester')}
                                            value={'requester_email'}
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('validation_requests.labels.fund')}
                                            value={'fund_name'}
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('validation_requests.labels.created_date')}
                                            value={'created_at'}
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('validation_requests.labels.assignee')}
                                            value={'assignee_email'}
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={translate('validation_requests.labels.status')}
                                            value={'state'}
                                        />
                                        <th className={'nowrap text-right th-narrow'}>
                                            {translate('validation_requests.labels.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fundRequests?.data.map((fundRequest) => (
                                        <tr key={fundRequest.id}>
                                            <td className={'text-strong'}>
                                                <span className="text-muted-dark">#</span>
                                                {fundRequest.id}
                                            </td>
                                            <td>
                                                <div className="relative">
                                                    <div className="block block-tooltip-details block-tooltip-hover flex flex-inline">
                                                        <strong className="text-primary">
                                                            {strLimit(fundRequest.email || 'Geen E-mail', 40)}
                                                        </strong>
                                                        {fundRequest.email?.length > 40 && (
                                                            <div className="tooltip-content tooltip-content-fit tooltip-content-bottom tooltip-content-compact">
                                                                <em className="triangle" />
                                                                <div className="nowrap">
                                                                    {fundRequest.email || 'Geen E-mail'}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-strong text-md text-muted-dark">
                                                    {fundRequest.bsn ? `BSN: ${fundRequest.bsn}` : 'Geen BSN'}
                                                </div>
                                            </td>
                                            <td>{fundRequest.fund.name}</td>
                                            <td>
                                                <strong className="text-primary">
                                                    {fundRequest.created_at_locale?.split(' - ')[0]}
                                                </strong>
                                                <br />
                                                <strong className="text-strong text-md text-muted-dark">
                                                    {fundRequest.created_at_locale?.split(' - ')[1]}
                                                </strong>
                                            </td>
                                            <td>
                                                {fundRequest.employee ? (
                                                    <div className="text-primary">
                                                        <strong>{fundRequest.employee.email}</strong>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">Niet toegewezen</span>
                                                )}
                                            </td>
                                            <td>
                                                {fundRequest.state == 'pending' && fundRequest.employee ? (
                                                    <div className="label label-tag label-round label-warning">
                                                        <span className="mdi mdi-circle-outline icon-start" />
                                                        <span>In behandeling</span>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={classNames(
                                                            'label',
                                                            'label-tag',
                                                            'label-round',
                                                            `label-${stateLabels[fundRequest.state]?.label}`,
                                                        )}>
                                                        <em
                                                            className={classNames(
                                                                'mdi',
                                                                `mdi-${stateLabels[fundRequest.state]?.icon}`,
                                                                `icon-start`,
                                                            )}
                                                        />
                                                        {fundRequest.state_locale}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={'text-right'}>
                                                <NavLink
                                                    to={getShowUrl(fundRequest)}
                                                    className="button button-sm button-primary pull-right">
                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                    {translate('validation_requests.buttons.view')}
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {fundRequests?.meta.total == 0 && (
                <EmptyCard type={'card-section'} title={translate('validation_requests.labels.empty_table')} />
            )}

            {fundRequests?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={fundRequests.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
