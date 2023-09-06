import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import Organization from '../../props/models/Organization';
import Employee from '../../props/models/Employee';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ModalButton } from './elements/ModalButton';
import { useTranslation } from 'react-i18next';
import { useOrganizationService } from '../../services/OrganizationService';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';

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
    const { t } = useTranslation();
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
                .then(
                    () => onSuccess(),
                    (res) => form.setErrors(res.status == '429' ? { email: [res.data.message] } : res.data.errors),
                )
                .finally(() => form.setIsLocked(false));
        },
    );

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
                <div className="modal-header">{t('modals.modal_transfer_organization_ownership.title')}</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-offset-2 col-lg-12">
                                <div className="form-group">
                                    <label className="form-label form-label-required">
                                        {t('modals.modal_transfer_organization_ownership.labels.transfer_to')}
                                    </label>
                                    <SelectControl
                                        value={form.values.employee_id?.toString()}
                                        propKey={'id'}
                                        propValue={'email'}
                                        options={adminEmployees}
                                        allowSearch={true}
                                        onChange={(value) => {
                                            form.update({ employee_id: value });
                                        }}
                                        optionsComponent={SelectControlOptions}
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
                                    {t('modals.modal_transfer_organization_ownership.info')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton
                        button={{ onClick: modal.close }}
                        text={t('modals.modal_transfer_organization_ownership.buttons.cancel')}
                        type="default"
                    />
                    <ModalButton
                        button={{ onClick: form.submit }}
                        text={t('modals.modal_transfer_organization_ownership.buttons.submit')}
                        type="primary"
                        submit={true}
                    />
                </div>
            </form>
        </div>
    );
}
