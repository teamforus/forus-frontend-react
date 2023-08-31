import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';

export default function ModalFundRequestDisregard({
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

    const form = useFormBuilder({ note: '', notify: true }, (values) => {
        setProgress(0);

        return fundRequestService
            .disregard(organization.id, fundRequest.id, values)
            .then(
                () => {
                    modal.close();
                    onSubmitted();
                },
                (res) => {
                    form.setIsLocked(false);

                    if (res.status === 422) {
                        return form.setErrors(res.data.errors);
                    }

                    modal.close();
                    onSubmitted(res);
                },
            )
            .finally(() => setProgress(100));
    });

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon modal-icon-primary">
                    <div className="mdi mdi-message-text-outline" />
                </div>

                <div className="modal-body form">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">Aanvraag kan niet worden beoordeeld</div>
                            <div className="modal-text">
                                Bevestig dat u deze aanvraag buiten behandeling wilt plaatsen. De aanvrager kunt u
                                hierover informeren door een bericht in te vullen.
                            </div>
                            <div className="modal-warning">
                                <em className="mdi mdi-alert-circle text-warning">&nbsp;</em>
                                <span>Let op: de aanvrager kan hierna een nieuwe aanvraag starten.</span>
                            </div>
                        </div>
                        <div className="form-group text-center">
                            <label className="checkbox checkbox-narrow" form={'notifyDisregard'}>
                                <input
                                    type="checkbox"
                                    checked={form.values.notify}
                                    onChange={(e) => form.update({ notify: e.target.checked })}
                                    hidden={true}
                                    id="notifyDisregard"
                                />
                                <div className="checkbox-label">
                                    <div className="checkbox-box">
                                        <div className="mdi mdi-check" />
                                    </div>
                                    <div className="modal-text">Verstuur de aanvrager een bericht</div>
                                </div>
                            </label>
                            <FormError error={form.errors?.notify} />
                        </div>
                        {form.values.notify && (
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
                        )}
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Sluiten
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestig
                    </button>
                </div>
            </form>
        </div>
    );
}
