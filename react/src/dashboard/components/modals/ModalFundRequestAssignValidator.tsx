import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';
import SelectControl from '../elements/select-control/SelectControl';
import Employee from '../../props/models/Employee';
import { strLimit } from '../../helpers/string';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';

export default function ModalFundRequestAssignValidator({
    modal,
    employees,
    className,
    fundRequest,
    onSubmitted,
    organization,
}: {
    modal: ModalState;
    employees: Array<Employee>;
    className?: string;
    fundRequest: FundRequest;
    onSubmitted: (res?: ResponseError) => void;
    organization: Organization;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();

    const [listEmployees] = useState(
        employees?.map((employee) => {
            return { ...employee, label: strLimit(employee.email || employee.identity_address, 32) };
        }),
    );

    const form = useFormBuilder({ employee_id: listEmployees[0]?.id }, async (values) => {
        setProgress(0);

        return fundRequestService
            .assignBySupervisor(organization.id, fundRequest.id, values)
            .then(() => {
                modal.close();
                onSubmitted();
            })
            .catch((err: ResponseError) => {
                form.setIsLocked(false);
                form.setErrors(err.data.errors);
            })
            .finally(() => setProgress(100));
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modal_fund_request_assign.header.title')}</div>

                <div className="modal-body modal-body-visible form">
                    <div className="modal-section">
                        <div className="row">
                            <div className="col col-lg-10 col col-lg-offset-1">
                                <div className="form-group">
                                    <label className="form-label form-label-required">
                                        {translate('modal_fund_request_assign.label.employees')}
                                    </label>
                                    <SelectControl
                                        propValue={'label'}
                                        propKey={'id'}
                                        options={listEmployees}
                                        value={form.values.employee_id}
                                        onChange={(employee_id: number) => form.update({ employee_id })}
                                    />
                                    <FormError error={form.errors?.employee_id} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleer
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
