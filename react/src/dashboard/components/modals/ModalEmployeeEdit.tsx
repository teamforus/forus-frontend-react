import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import Organization from '../../props/models/Organization';
import Employee from '../../props/models/Employee';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { useRoleService } from '../../services/RoleService';
import { useEmployeeService } from '../../services/EmployeeService';
import { ModalButton } from './elements/ModalButton';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import Role from '../../props/models/Role';
import { ResponseError } from '../../props/ApiResponses';

export default function ModalEmployeeEdit({
    modal,
    employee,
    className,
    onSubmit,
    cancelButton,
    organization,
}: {
    modal: ModalState;
    employee?: Employee;
    className?: string;
    onSubmit?: () => void;
    cancelButton?: ModalButton;
    organization: Organization;
}) {
    const [roles, setRoles] = useState([]);
    const roleService = useRoleService();
    const employeeService = useEmployeeService();

    const form = useFormBuilder(
        {
            email: employee?.email || '',
            roles: employee?.roles.reduce((list, role) => ({ ...list, [role.id]: 1 }), {}) || {},
        },
        (values) => {
            const roles = values.roles as object;
            const data = { ...form.values, roles: Object.keys(roles).filter((key) => roles[key]) };

            const promise = employee
                ? employeeService.update(organization.id, employee.id, data)
                : employeeService.store(organization.id, data);

            return promise
                .then(
                    () => {
                        onSubmit();
                        modal.close();
                    },
                    (res: ResponseError) => {
                        form.setErrors(res.status == 429 ? { email: [res.data.message] } : res.data.errors);
                    },
                )
                .finally(() => form.setIsLocked(false));
        },
    );

    const onChangeRole = useCallback(
        (checked: boolean, role: Role) => {
            form.update({ roles: { ...(form.values['roles'] as object), [role.id]: checked ? 1 : 0 } });
        },
        [form],
    );

    useEffect(() => {
        roleService.list().then((res) => setRoles(res.data.data));
    }, [roleService]);

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                'modal-notification',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">{employee ? 'Medewerker aanpassen' : 'Medewerker toevoegen'}</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        {!employee && (
                            <div className="form-group">
                                <label htmlFor="" className="form-label form-label-required">
                                    E-mailadres
                                </label>
                                <input
                                    type="text"
                                    value={form.values.email?.toString()}
                                    placeholder="E-mailadres..."
                                    id="email_value"
                                    data-dusk="formEmployeeEmail"
                                    className="form-control"
                                    onChange={(e) => form.update({ email: e.target.value })}
                                />
                                <FormError error={form.errors['email']} />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Rollen</label>

                            <div className="block block-permissions-list">
                                {roles.map((role) => (
                                    <div key={role.id} className="permission-item">
                                        <CheckboxControl
                                            id={'role_' + role.id}
                                            title={role.name}
                                            tooltip={role.description}
                                            checked={form.values.roles[role.id] || false}
                                            onChange={(e) => onChangeRole(e.target.checked, role)}
                                            className={'checkbox-narrow'}
                                            customElement={
                                                <span className="permission-name">
                                                    <span className="ellipsis">{role.name}</span>
                                                </span>
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                            <FormError error={form.errors['roles']} />
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton type="default" button={{ onClick: modal.close, ...cancelButton }} text={'Sluiten'} />
                    <ModalButton type="primary" button={{ onClick: form.submit }} text={'Bevestig'} submit={true} />
                </div>
            </form>
        </div>
    );
}
