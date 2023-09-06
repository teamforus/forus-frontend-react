import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { mainContext } from '../../../contexts/MainContext';
import { useEmployeeService } from '../../../services/EmployeeService';
import { NavLink } from 'react-router-dom';
import { classList, hasPermission } from '../../../helpers/utils';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { t } from 'i18next';
import useFilters from '../../../hooks/useFilters';
import { strLimit } from '../../../helpers/string';
import Employee from '../../../props/models/Employee';
import Paginator from '../../../modules/paginator/components/Paginator';
import ModalEmployeeEdit from '../../modals/ModalEmployeeEdit';
import ModalDangerZone from '../../modals/ModalDangerZone';
import ModalTransferOrganizationOwnership from '../../modals/ModalTransferOrganizationOwnership';
import ModalExportTypeLegacy from '../../modals/ModalExportTypeLegacy';
import { format } from 'date-fns';
import { useFileService } from '../../../services/FileService';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useEnvData from '../../../hooks/useEnvData';

export default function Employees() {
    const envData = useEnvData();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();
    const openModal = useOpenModal();
    const authIdentity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();

    const { setActiveOrganization } = useContext(mainContext);

    const [employees, setEmployees] = useState<PaginationData<Employee>>(null);
    const [adminEmployees, setAdminEmployees] = useState([]);

    const filter = useFilters({
        q: '',
        per_page: 15,
    });

    const fileService = useFileService();
    const employeeService = useEmployeeService();

    const fetchEmployees = useCallback(() => {
        employeeService.list(activeOrganization.id, filter.activeValues).then(
            (res) => setEmployees(res.data),
            (res) => console.error(res),
        );
    }, [activeOrganization.id, employeeService, filter.activeValues]);

    const fetchAdminEmployees = useCallback(() => {
        employeeService.list(activeOrganization.id, { role: 'admin', per_page: 1000 }).then(
            (res) =>
                setAdminEmployees(
                    res.data.data.filter((item) => item.identity_address !== activeOrganization.identity_address),
                ),
            (res) => console.error(res),
        );
    }, [employeeService, activeOrganization]);

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

    const doExport = useCallback(
        (exportType: string) => {
            employeeService.export(activeOrganization.id, { ...filter.activeValues, export_type: exportType }).then(
                (res) => {
                    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

                    res.response.arrayBuffer().then((fileData) => {
                        const fileType = res.response.headers.get('Content-Type') + ';charset=utf-8;';
                        const fileName = `${envData.client_type}_${activeOrganization.name}_employees_${dateTime}.${exportType}`;

                        fileService.downloadFile(fileName, fileData, fileType);
                    });
                },
                (res: ResponseError) => {
                    pushDanger('Error!', res.data.message);
                },
            );
        },
        [pushDanger, fileService, filter.activeValues, activeOrganization, employeeService, envData.client_type],
    );

    const exportEmployees = useCallback(() => {
        openModal((modal) => (
            <ModalExportTypeLegacy
                modal={modal}
                onSubmit={(exportType) => {
                    doExport(exportType);
                }}
            />
        ));
    }, [doExport, openModal]);

    const transferOwnership = useCallback(
        function (adminEmployees) {
            openModal((modal) => (
                <ModalTransferOrganizationOwnership
                    modal={modal}
                    adminEmployees={adminEmployees}
                    organization={activeOrganization}
                    onSubmit={(employee) => {
                        setActiveOrganization({ ...activeOrganization, identity_address: employee.identity_address });
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
                    title={t('modals.danger_zone.remove_organization_employees.title')}
                    description={t('modals.danger_zone.remove_organization_employees.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: t('modals.danger_zone.remove_organization_employees.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            employeeService.delete(activeOrganization.id, employee.id).then(
                                () => {
                                    filter.update({});
                                    pushSuccess('Gelukt!', 'Medewerker verwijderd.');
                                    modal.close();
                                },
                                (res) => pushDanger(res.data.message),
                            );
                        },
                        text: t('modals.danger_zone.remove_organization_employees.buttons.confirm'),
                    }}
                />
            ));
        },
        [openModal, employeeService, activeOrganization.id, filter, pushSuccess, pushDanger],
    );

    useEffect(() => fetchEmployees(), [fetchEmployees]);
    useEffect(() => fetchAdminEmployees(), [fetchAdminEmployees]);

    if (!employees || !adminEmployees) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">Medewerkers ({employees?.meta.total})</div>
                    </div>

                    <div className="flex">
                        <div className="block block-inline-filters">
                            {activeOrganization.allow_2fa_restrictions &&
                                hasPermission(activeOrganization, 'manage_organization') && (
                                    <NavLink
                                        className={'button button-default button-sm'}
                                        to={getStateRouteUrl('organization-security', {
                                            organizationId: activeOrganization.id,
                                        })}>
                                        <em className="mdi mdi-security icon-start" />
                                        {t('organization_employees.buttons.security')}
                                    </NavLink>
                                )}
                            <button
                                type="button"
                                className="button button-primary button-sm"
                                onClick={() => exportEmployees()}>
                                <span className="mdi mdi-download icon-start" />
                                {t('organization_employees.buttons.export')}
                            </button>
                            <button
                                type="button"
                                className={'button button-primary button-sm '}
                                onClick={() => editEmployee()}>
                                <em className="mdi mdi-plus-circle icon-start" />
                                {t('organization_employees.buttons.add')}
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
            </div>

            {employees?.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('organization_employees.labels.email')}</th>
                                        <th>{t('organization_employees.labels.roles')}</th>
                                        <th>{t('organization_employees.labels.auth_2fa')}</th>
                                        <th className={'text-right'}>{t('organization_employees.labels.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees?.data.map((employee: Employee) => (
                                        <tr key={employee.id}>
                                            <td
                                                id={'employee_email'}
                                                data-dusk={'employeeEmail'}
                                                className={'text-primary-light'}>
                                                {employee.email || strLimit(employee.identity_address, 32)}
                                            </td>
                                            {activeOrganization.identity_address != employee.identity_address && (
                                                <td
                                                    className={classList([
                                                        'nowrap',
                                                        employee.roles.length > 0 ? '' : 'text-muted',
                                                    ])}>
                                                    {rolesList(employee)}
                                                </td>
                                            )}
                                            {activeOrganization.identity_address == employee.identity_address && (
                                                <td className={classList(['nowrap'])}>
                                                    <div className="text-primary">
                                                        {t('organization_employees.labels.owner')}
                                                    </div>
                                                </td>
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

                                            <td className={'text-right'}>
                                                {activeOrganization.identity_address != employee.identity_address && (
                                                    <Fragment>
                                                        <a
                                                            className="text-primary-light"
                                                            data-dusk={'btnEmployeeEdit'}
                                                            onClick={() => editEmployee(employee)}>
                                                            {t('organization_employees.buttons.adjust')}
                                                        </a>
                                                        {authIdentity.address !== employee.identity_address && (
                                                            <Fragment>
                                                                &nbsp;&nbsp;
                                                                <a
                                                                    className="text-danger"
                                                                    data-dusk={'btnEmployeeDelete'}
                                                                    onClick={() => deleteEmployee(employee)}>
                                                                    {t('organization_employees.buttons.delete')}
                                                                </a>
                                                            </Fragment>
                                                        )}
                                                    </Fragment>
                                                )}

                                                {activeOrganization.identity_address == employee.identity_address && (
                                                    <Fragment>
                                                        {adminEmployees.length > 0 &&
                                                        authIdentity.address === activeOrganization.identity_address ? (
                                                            <a
                                                                className="text-primary-light"
                                                                onClick={() => transferOwnership(adminEmployees)}>
                                                                {t('organization_employees.buttons.transfer_ownership')}
                                                            </a>
                                                        ) : (
                                                            <span className={'text-muted'}>
                                                                {t('organization_employees.labels.owner')}
                                                            </span>
                                                        )}
                                                    </Fragment>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {employees?.meta.total > 0 && (
                <div className="card-section" hidden={employees?.meta.last_page <= 1}>
                    {employees?.meta && (
                        <Paginator meta={employees.meta} filters={filter.values} updateFilters={filter.update} />
                    )}
                </div>
            )}

            {employees?.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen medewerkers gevonden</div>
                    </div>
                </div>
            )}
        </div>
    );
}
