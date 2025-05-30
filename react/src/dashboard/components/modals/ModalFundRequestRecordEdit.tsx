import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';
import FundRequestRecord from '../../props/models/FundRequestRecord';
import FormHint from '../elements/forms/errors/FormHint';
import SelectControl from '../elements/select-control/SelectControl';
import classNames from 'classnames';

export default function ModalFundRequestRecordEdit({
    modal,
    onEdit,
    className,
    fundRequest,
    organization,
    fundRequestRecord,
}: {
    modal: ModalState;
    onEdit: (res?: ResponseError) => void;
    className?: string;
    fundRequest: FundRequest;
    organization: Organization;
    fundRequestRecord: FundRequestRecord;
}) {
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();

    const [criterion] = useState(
        fundRequest?.fund?.criteria?.find((criterion) => criterion.id == fundRequestRecord.fund_criterion_id),
    );

    const [recordNumeric] = useState(fundRequestRecord.record_type.type == 'number');
    const [recordSelect] = useState(fundRequestRecord.record_type.type == 'select');
    const [initialValue] = useState(recordNumeric ? parseFloat(fundRequestRecord.value) : fundRequestRecord.value);

    const form = useFormBuilder(
        {
            value: initialValue,
        },
        async (values) => {
            setProgress(0);

            return fundRequestService
                .updateRecord(organization.id, fundRequestRecord.fund_request_id, fundRequestRecord.id, values)
                .then(() => {
                    modal.close();
                    onEdit();
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors);
                })
                .finally(() => setProgress(100));
        },
    );

    return (
        <div
            className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}
            data-dusk="modalFundRequestRecordEdit">
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">Persoonsgegevens aanpassen</div>
                <div className="modal-body modal-body-visible">
                    <div className="modal-section form">
                        <div className="row">
                            <div className="col col-lg-8 col-lg-offset-2 col-lg-12">
                                <div className="form-group">
                                    <label className="form-label form-label-required">
                                        {fundRequestRecord.record_type.name}
                                    </label>

                                    {recordNumeric && (
                                        <input
                                            className="form-control"
                                            value={form.values.value}
                                            type="number"
                                            data-dusk="numberInput"
                                            onChange={(e) => form.update({ value: e.target.value })}
                                            step={1}
                                        />
                                    )}

                                    {recordSelect && (
                                        <SelectControl
                                            value={form.values.value}
                                            propKey={'value'}
                                            onChange={(value: string | number) => form.update({ value })}
                                            options={criterion.record_type.options}
                                            allowSearch={false}
                                        />
                                    )}

                                    {!recordNumeric && !recordSelect && (
                                        <input
                                            className="form-control"
                                            value={form.values.value}
                                            onChange={(e) => form.update({ value: e.target.value })}
                                        />
                                    )}
                                    <FormError error={form.errors?.value} />
                                    <FormHint text={criterion.description} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close} id="close">
                        Sluiten
                    </button>
                    <button
                        className="button button-primary"
                        type="submit"
                        data-dusk="submitBtn"
                        disabled={initialValue == form.values?.value}>
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
