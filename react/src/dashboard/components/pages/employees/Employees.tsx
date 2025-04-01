import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { mainContext } from '../../../contexts/MainContext';
import { useEmployeeService } from '../../../services/EmployeeService';
import { NavLink } from 'react-router-dom';
import { hasPermission } from '../../../helpers/utils';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useFilter from '../../../hooks/useFilter';
import { strLimit } from '../../../helpers/string';
import Employee from '../../../props/models/Employee';
import Paginator from '../../../modules/paginator/components/Paginator';
import ModalEmployeeEdit from '../../modals/ModalEmployeeEdit';
import ModalDangerZone from '../../modals/ModalDangerZone';
import ModalTransferOrganizationOwnership from '../../modals/ModalTransferOrganizationOwnership';
import { PaginationData } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import useIsProviderPanel from '../../../hooks/useIsProviderPanel';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableRowActions from '../../elements/tables/TableRowActions';
import useEmployeeExportService from '../../../services/exports/useEmployeeExportService';

export default function Employees() {
    const isProviderPanel = useIsProviderPanel();

    const { setActiveOrganization } = useContext(mainContext);

    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const authIdentity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();

    const employeeService = useEmployeeService();
    const paginatorService = usePaginatorService();
    const employeeExportService = useEmployeeExportService();

    const [loading, setLoading] = useState<boolean>(false);
    const [employees, setEmployees] = useState<PaginationData<Employee>>(null);
    const [paginatorKey] = useState('employees');
    const [adminEmployees, setAdminEmployees] = useState([]);

    const { headElement, configsElement } = useConfigurableTable(employeeService.getColumns(isProviderPanel));

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchEmployees = useCallback(() => {
        setLoading(true);
        setProgress(0);

        employeeService
            .list(activeOrganization.id, filter.activeValues)
            .then((res) => setEmployees(res.data))
            .catch(pushApiError)
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [activeOrganization.id, employeeService, filter.activeValues, setProgress, pushApiError]);

    const fetchAdminEmployees = useCallback(() => {
        employeeService
            .list(activeOrganization.id, { role: 'admin', per_page: 1000 })
            .then((res) =>
                setAdminEmployees(
                    res.data.data.filter((item) => item.identity_address !== activeOrganization.identity_address),
                ),
            )
            .catch(pushApiError);
    }, [employeeService, activeOrganization.id, activeOrganization.identity_address, pushApiError]);

    const rolesList = useCallback((employee: Employee) => {
        const rolesList = employee.roles
            .map((role) => role.name)
            .sort((a, b) => (a == b ? 0 : a < b ? -1 : 1))
            .join(', ');

        return strLimit(rolesList, 64) || 'Geen rollen';
    }, []);

    const editEmployee = useCallback(
        (employee: Employee = null) => {
            openModal((modal) => (
                <ModalEmployeeEdit
                    modal={modal}
                    organization={activeOrganization}
                    employee={employee}
                    onSubmit={() => {
                        fetchAdminEmployees();
                        filter.update({ page: employee ? employees.meta.current_page : employees.meta.last_page });

                        if (!employee) {
                            pushSuccess('Gelukt!', 'Nieuwe medewerker toegevoegd.');
                        } else {
                            pushSuccess('Gelukt!', 'Employee updated.');
                        }
                    }}
                />
            ));
        },
        [
            openModal,
            activeOrganization,
            fetchAdminEmployees,
            filter,
            employees?.meta.current_page,
            employees?.meta.last_page,
            pushSuccess,
        ],
    );

    const exportEmployees = useCallback(() => {
        employeeExportService.exportData(activeOrganization.id, {
            ...filter.activeValues,
        });
    }, [activeOrganization.id, employeeExportService, filter.activeValues]);

    const transferOwnership = useCallback(
        function (adminEmployees) {
            openModal((modal) => (
                <ModalTransferOrganizationOwnership
                    modal={modal}
                    adminEmployees={adminEmployees}
                    organization={activeOrganization}
                    onSubmit={(employee) => {
                        setActiveOrganization(
                            Object.assign(activeOrganization, { identity_address: employee.identity_address }),
                        );
                    }}
                />
            ));
        },
        [activeOrganization, openModal, setActiveOrganization],
    );

    const deleteEmployee = useCallback(
        function (employee) {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_organization_employees.title')}
                    description={translate('modals.danger_zone.remove_organization_employees.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_organization_employees.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            employeeService
                                .delete(activeOrganization.id, employee.id)
                                .then(() => {
                                    filter.update({});
                                    pushSuccess('Gelukt!', 'Medewerker verwijderd.');
                                    modal.close();
                                })
                                .catch(pushApiError);
                        },
                        text: translate('modals.danger_zone.remove_organization_employees.buttons.confirm'),
                    }}
                />
            ));
        },
        [openModal, translate, employeeService, activeOrganization.id, filter, pushSuccess, pushApiError],
    );

    const canEditEmployee = useCallback(
        (employee: Employee) => {
            const isOwner = authIdentity.address === activeOrganization.identity_address;
            const isOwnerEmployee = activeOrganization.identity_address === employee.identity_address;

            return !isOwnerEmployee || (isOwner && activeOrganization.offices_count > 0);
        },
        [activeOrganization, authIdentity.address],
    );

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchAdminEmployees();
    }, [fetchAdminEmployees]);

    if (!employees || !adminEmployees) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">Medewerkers ({employees?.meta.total})</div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        {activeOrganization.allow_2fa_restrictions &&
                            hasPermission(activeOrganization, 'manage_organization') && (
                                <NavLink
                                    className={'button button-default button-sm'}
                                    to={getStateRouteUrl('organization-security', {
                                        organizationId: activeOrganization.id,
                                    })}>
                                    <em className="mdi mdi-security icon-start" />
                                    {translate('organization_employees.buttons.security')}
                                </NavLink>
                            )}
                        <button
                            type="button"
                            data-dusk="export"
                            className="button button-primary button-sm"
                            onClick={() => exportEmployees()}>
                            <span className="mdi mdi-download icon-start" />
                            {translate('organization_employees.buttons.export')}
                        </button>
                        <button
                            type="button"
                            className={'button button-primary button-sm '}
                            data-dusk={'addEmployee'}
                            onClick={() => editEmployee()}>
                            <em className="mdi mdi-plus-circle icon-start" />
                            {translate('organization_employees.buttons.add')}
                        </button>

                        <div className="form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={filter.values.q}
                                    placeholder="Zoeken"
                                    data-dusk="searchEmployee"
                                    className="form-control"
                                    onChange={(e) => filter.update({ q: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={loading}
                empty={employees?.meta.total == 0}
                emptyTitle={'Geen medewerkers gevonden'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table" id="employeesTable">
                                {headElement}

                                <tbody>
                                    {employees?.data.map((employee: Employee) => (
                                        <tr key={employee.id} data-dusk={`employeeRow${employee.id}`}>
                                            <td id={'employee_email'} data-dusk={'employeeEmail'}>
                                                <div className={'text-primary'}>
                                                    {employee.email || strLimit(employee.identity_address, 32)}
                                                </div>
                                                {activeOrganization.identity_address != employee.identity_address ? (
                                                    <div className={'text-muted text-md'}>
                                                        {strLimit(rolesList(employee) || 'Geen...', 32)}
                                                    </div>
                                                ) : (
                                                    <div className="text-muted text-md">
                                                        {translate('organization_employees.labels.owner')}
                                                    </div>
                                                )}
                                            </td>
                                            {isProviderPanel && (
                                                <Fragment>
                                                    <td>
                                                        {employee?.branch?.name && (
                                                            <div className="text-primary">
                                                                {strLimit(employee.branch?.name, 32)}
                                                            </div>
                                                        )}

                                                        {employee?.branch?.id && (
                                                            <div>
                                                                ID <strong>{strLimit(employee.branch?.id, 32)}</strong>
                                                            </div>
                                                        )}

                                                        {!employee.branch?.id && !employee.branch?.name && (
                                                            <TableEmptyValue />
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className={employee?.branch?.number ? '' : 'text-muted'}>
                                                            {strLimit(employee.branch?.number?.toString(), 32) || (
                                                                <TableEmptyValue />
                                                            )}
                                                        </div>
                                                    </td>
                                                </Fragment>
                                            )}
                                            <td>
                                                {employee.is_2fa_configured && (
                                                    <div className="td-state-2fa">
                                                        <div className="state-2fa-icon">
                                                            <em className="mdi mdi-shield-check-outline text-primary" />
                                                        </div>
                                                        <div className="state-2fa-label">Actief</div>
                                                    </div>
                                                )}

                                                {!employee.is_2fa_configured && (
                                                    <div className="td-state-2fa">
                                                        <div className="state-2fa-icon">
                                                            <em className="mdi mdi-shield-off-outline text-muted" />
                                                        </div>
                                                        <div className="state-2fa-label">Nee</div>
                                                    </div>
                                                )}
                                            </td>

                                            {activeOrganization.identity_address != employee.identity_address ? (
                                                <td className={'table-td-actions text-right'}>
                                                    <TableRowActions
                                                        dataDusk={'btnEmployeeMenu'}
                                                        content={(e) => (
                                                            <div className="dropdown dropdown-actions">
                                                                {canEditEmployee(employee) && (
                                                                    <a
                                                                        className="dropdown-item"
                                                                        data-dusk={`btnEmployeeEdit${employee.id}`}
                                                                        onClick={() => {
                                                                            editEmployee(employee);
                                                                            e.close();
                                                                        }}>
                                                                        {translate(
                                                                            'organization_employees.buttons.adjust',
                                                                        )}
                                                                    </a>
                                                                )}

                                                                {authIdentity.address !== employee.identity_address && (
                                                                    <a
                                                                        className="dropdown-item"
                                                                        data-dusk={`btnEmployeeDelete${employee.id}`}
                                                                        onClick={() => {
                                                                            deleteEmployee(employee);
                                                                            e.close();
                                                                        }}>
                                                                        {translate(
                                                                            'organization_employees.buttons.delete',
                                                                        )}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    />
                                                </td>
                                            ) : (
                                                <td className={'table-td-actions text-right'}>
                                                    {adminEmployees.length > 0 &&
                                                    authIdentity.address === activeOrganization.identity_address ? (
                                                        <TableRowActions
                                                            dataDusk={'btnEmployeeMenu'}
                                                            content={(e) => (
                                                                <div className="dropdown dropdown-actions">
                                                                    <a
                                                                        className="dropdown-item"
                                                                        onClick={() => {
                                                                            transferOwnership(adminEmployees);
                                                                            e.close();
                                                                        }}>
                                                                        {translate(
                                                                            'organization_employees.buttons.transfer_ownership',
                                                                        )}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        />
                                                    ) : (
                                                        <span className={'text-muted'}>
                                                            {translate('organization_employees.labels.owner')}
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {employees?.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={employees.meta}
                            filters={filter.values}
                            updateFilters={filter.update}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
