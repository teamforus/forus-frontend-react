import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';
import classNames from 'classnames';

export default function ModalFundRequestRecordsDecline({
    modal,
    className,
    fundRequest,
    onSubmitted,
    organization,
}: {
    modal: ModalState;
    className?: string;
    fundRequest: FundRequest;
    onSubmitted: (res?: ResponseError) => void;
    organization: Organization;
}) {
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();

    const form = useFormBuilder({ note: '' }, async () => {
        setProgress(0);

        return fundRequestService
            .decline(organization.id, fundRequest.id, form.values)
            .then(() => {
                modal.close();
                onSubmitted();
            })
            .catch((err: ResponseError) => {
                form.setIsLocked(false);

                if (err.status === 422) {
                    return form.setErrors(err.data.errors);
                }

                modal.close();
                onSubmitted(err);
            })
            .finally(() => setProgress(100));
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon modal-icon-primary">
                    <div className="mdi mdi-message-text-outline" />
                </div>

                {fundRequest.email ? (
                    <div className="modal-body">
                        <div className="modal-section modal-section-pad">
                            <div className="text-center">
                                <div className="modal-heading">Weiger aanvraag</div>
                                <div className="modal-text">
                                    U staat op het punt om een aanvraag te weigeren. Weet u zeker dat u deze aanvraag
                                    wilt weigeren? The user will receive an email notification.
                                    <br />
                                    <br />
                                    Optioneel kunt u een bericht sturen naar de aanvrager.
                                    <br />
                                    &nbsp;
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-label">Bericht (optioneel)</div>
                                <textarea
                                    className="form-control"
                                    value={form.values.note}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                    placeholder="Bericht naar aanvrager"
                                />
                                <FormError error={form.errors?.note} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="modal-body">
                        <div className="modal-section modal-section-pad">
                            <div className="modal-heading text-center">Weiger aanvraag</div>
                            <div className="modal-text text-center">
                                U staat op het punt om een aanvraag te weigeren. Weet u zeker dat u deze aanvraag wilt
                                weigeren?
                                <br />
                                <br />
                                {fundRequest.contact_information ? (
                                    <span>
                                        <div className="text-strong">De aanvrager heeft geen e-mailadres opgegeven</div>
                                        Is er contact met de aanvrager nodig? Gebruik dan onderstaande contactgegevens.
                                        <br />
                                        <br />
                                        <div className="text-strong">Contactgegevens:</div>
                                        <strong>{fundRequest.contact_information}</strong>
                                    </span>
                                ) : (
                                    <span>
                                        <div className="text-strong">De aanvrager heeft geen e-mailadres opgegeven</div>
                                        <br />
                                        Helaas heeft de aanvrager geen contactgegevens opgegeven, indien er contact
                                        moment nodig is dient dit buiten het platform te gebeuren.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
