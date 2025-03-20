import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import Organization from '../../props/models/Organization';
import Employee from '../../props/models/Employee';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ModalButton } from './elements/ModalButton';
import { useOrganizationService } from '../../services/OrganizationService';
import SelectControl from '../elements/select-control/SelectControl';
import { ResponseError } from '../../props/ApiResponses';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';

export default function ModalTransferOrganizationOwnership({
    modal,
    onSubmit,
    className,
    organization,
    adminEmployees,
}: {
    modal: ModalState;
    onSubmit?: (employee: Employee) => void;
    className?: string;
    organization: Organization;
    adminEmployees: Array<Employee>;
}) {
    const translate = useTranslate();

    const organizationService = useOrganizationService();

    const form = useFormBuilder(
        {
            employee_id: adminEmployees[0]?.id,
        },
        (values) => {
            const employee = adminEmployees.find((employee) => employee.id == values.employee_id);

            const onSuccess = () => {
                onSubmit(employee);
                modal.close();
            };

            organizationService
                .transferOwnership(organization.id, values)
                .then(() => onSuccess())
                .catch((err: ResponseError) => {
                    form.setErrors(err.status == 429 ? { email: [err.data.message] } : err.data.errors);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-md',
                'modal-animated',
                'modal-notification',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">{translate('modals.modal_transfer_organization_ownership.title')}</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-offset-2 col-lg-12">
                                <div className="form-group">
                                    <label className="form-label form-label-required">
                                        {translate('modals.modal_transfer_organization_ownership.labels.transfer_to')}
                                    </label>
                                    <SelectControl
                                        value={form.values.employee_id?.toString()}
                                        propKey={'id'}
                                        propValue={'email'}
                                        options={adminEmployees}
                                        allowSearch={true}
                                        onChange={(value?: number) => {
                                            form.update({ employee_id: value });
                                        }}
                                    />
                                    <FormError error={form.errors['employee']} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-section">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-offset-2 col-lg-12">
                                <div className="block block-info">
                                    <em className="mdi mdi-information block-info-icon" />
                                    {translate('modals.modal_transfer_organization_ownership.info')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton
                        button={{ onClick: modal.close }}
                        text={translate('modals.modal_transfer_organization_ownership.buttons.cancel')}
                        type="default"
                    />
                    <ModalButton
                        button={{ onClick: form.submit }}
                        text={translate('modals.modal_transfer_organization_ownership.buttons.submit')}
                        type="primary"
                        submit={true}
                    />
                </div>
            </form>
        </div>
    );
}
