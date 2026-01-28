import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';
import classNames from 'classnames';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import FormGroup from '../elements/forms/elements/FormGroup';

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

    const form = useFormBuilder({ note: '', notify: true }, async (values) => {
        setProgress(0);

        return fundRequestService
            .disregard(organization.id, fundRequest.id, values)
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
        <div
            className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}
            data-dusk="modalDisregardFundRequest">
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
                        <FormGroup
                            textAlign="center"
                            error={form.errors?.notify}
                            input={() => (
                                <CheckboxControl
                                    id="notifyDisregard"
                                    checked={form.values.notify}
                                    narrow={true}
                                    onChange={(_, checked) => form.update({ notify: checked })}>
                                    <div className="modal-text">Verstuur de aanvrager een bericht</div>
                                </CheckboxControl>
                            )}
                        />
                        {form.values.notify && (
                            <FormGroup
                                label="Bericht (optioneel)"
                                error={form.errors?.note}
                                input={(id) => (
                                    <textarea
                                        className="form-control"
                                        id={id}
                                        value={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                        placeholder="Bericht naar aanvrager"
                                    />
                                )}
                            />
                        )}
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Sluiten
                    </button>
                    <button type="submit" className="button button-primary" data-dusk="submitBtn">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
