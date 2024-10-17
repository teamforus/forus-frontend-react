import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import { ResponseError } from '../../props/ApiResponses';
import useSetProgress from '../../hooks/useSetProgress';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';
import FundRequestRecord from '../../props/models/FundRequestRecord';
import classNames from 'classnames';

export default function ModalFundRequestClarify({
    modal,
    className,
    fundRequest,
    onSubmitted,
    organization,
    fundRequestRecord,
}: {
    modal: ModalState;
    className?: string;
    fundRequest: FundRequest;
    onSubmitted: (err?: ResponseError) => void;
    organization: Organization;
    fundRequestRecord: FundRequestRecord;
}) {
    const setProgress = useSetProgress();
    const fundRequestService = useFundRequestValidatorService();

    const form = useFormBuilder({ question: '' }, async () => {
        setProgress(0);

        return fundRequestService
            .requestRecordClarification(
                organization.id,
                fundRequestRecord.fund_request_id,
                fundRequestRecord.id,
                form.values.question,
            )
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

            {fundRequest.email ? (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-icon">
                        <div className="mdi mdi-message-text-outline" />
                    </div>
                    <div className="modal-body form">
                        <div className="modal-section modal-section-pad">
                            <div className="text-center">
                                <div className="modal-heading">Aanvullingsverzoek</div>
                                <div className="modal-text">
                                    Vraag de aanvrager om extra informatie als de aanvraag incompleet of onduidelijk is.
                                    Voeg een bericht toe aan dit verzoek.
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-label form-label-required">Bericht</div>
                                <textarea
                                    className="form-control"
                                    value={form.values.question}
                                    onChange={(e) => form.update({ question: e.target.value })}
                                    placeholder="Bericht aan aanvrager"
                                />
                                <FormError error={form.errors?.question} />
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
            ) : (
                <div className="modal-window">
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-icon">
                        <div className="mdi mdi-message-text-outline" />
                    </div>
                    <div className="modal-body form">
                        <div className="modal-section modal-section-pad">
                            {fundRequest.contact_information ? (
                                <div className="text-center">
                                    <div className="modal-heading">
                                        De aanvrager heeft geen e-mailadres, maar heeft wel contactgegevens opgegeven.
                                    </div>
                                    <div className="modal-text">
                                        <strong>Contactgegevens: </strong>
                                        <br />
                                        <span>{fundRequest.contact_information}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="modal-heading">
                                        De aanvrager heeft geen e-mailadres en heeft geen contactgegevens opgegeven.
                                    </div>
                                    <div className="modal-text">
                                        Helaas heeft de aanvrager geen contactgegevens opgegeven, als er aanvullende
                                        informatie nodig is om de aanvraag te beoordelen dient het contact buiten het
                                        systeem te verlopen.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer text-center">
                        <button className="button button-default" onClick={modal.close}>
                            Annuleer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
