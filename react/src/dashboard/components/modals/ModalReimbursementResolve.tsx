import React, { Fragment, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ApiResponseSingle, ResponseError } from '../../props/ApiResponses';
import Reimbursement from '../../props/models/Reimbursement';
import Organization from '../../props/models/Organization';
import useFormBuilder from '../../hooks/useFormBuilder';
import { useReimbursementsService } from '../../services/ReimbursementService';
import useSetProgress from '../../hooks/useSetProgress';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import Tooltip from '../elements/tooltip/Tooltip';

export default function ModalReimbursementResolve({
    modal,
    approve,
    organization,
    reimbursement,
    onSubmit,
    className,
}: {
    modal: ModalState;
    approve: boolean;
    organization: Organization;
    reimbursement: Reimbursement;
    onSubmit: (res: ApiResponseSingle<Reimbursement>) => void;
    className?: string;
}) {
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const reimbursementService = useReimbursementsService();

    const [showReason, setShowReason] = useState<boolean>(false);

    const form = useFormBuilder(
        {
            note: null,
            reason: null,
            state: approve ? 'approved' : 'declined',
        },
        async (values) => {
            const { note, reason, state } = values;

            const data = {
                note: note ? note : null,
                state: state,
                reason: showReason && reason ? reason : null,
            };

            const promise = approve
                ? reimbursementService.approve(organization.id, reimbursement.id, data)
                : reimbursementService.decline(organization.id, reimbursement.id, data);

            setProgress(0);

            promise
                .then((res) => {
                    pushSuccess('Gelukt!', approve ? 'Declaratie goedgekeurd!' : 'Declaratie afgewezen!');
                    onSubmit(res);
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data?.errors);
                    form.setIsLocked(false);
                    pushDanger('Mislukt!', err.data?.message);
                })
                .finally(() => setProgress(100));
        },
    );

    return (
        <div className={`modal modal-md modal-animated ${modal.loading ? 'modal-loading' : ''} ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <form className="form" onSubmit={form.submit}>
                    <a onClick={() => modal.close()} role="button" className="mdi mdi-close modal-close" />

                    <div className="modal-icon modal-icon-primary">
                        {form.values.state == 'declined' && <div className="mdi mdi-close"></div>}
                        {form.values.state == 'approved' && <div className="mdi mdi-check"></div>}
                    </div>

                    <div className="modal-body modal-body-visible">
                        {form.values.state == 'declined' && (
                            <div className="modal-section modal-section-pad">
                                <div className="modal-heading text-center">Declaratie geweigerd</div>

                                <div className="modal-text text-center">
                                    Weiger de aanvraag. Indien gewenst kunt u de deelnemer hierover informeren door een
                                    bericht te verzenden.
                                    <br />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notitie</label>

                                    <textarea
                                        className="form-control r-n"
                                        rows={3}
                                        defaultValue={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                        placeholder="Voeg een persoonlijke notitie toe"
                                    />
                                </div>

                                {form.values.state == 'declined' && reimbursement.identity_email && (
                                    <div className="form-group tooltipped tooltipped-inner">
                                        <CheckboxControl
                                            className={'checkbox-narrow'}
                                            checked={showReason}
                                            title={`Verstuur een bericht naar de deelnemer`}
                                            onChange={() => {
                                                setShowReason(!showReason);
                                            }}
                                        />
                                        <Tooltip
                                            text={
                                                'U kunt alleen een bericht naar de deelnemer versturen als er een e-mailadres is opgegeven..'
                                            }
                                        />
                                    </div>
                                )}

                                {form.values.state == 'declined' && reimbursement.identity_email && (
                                    <Fragment>
                                        {showReason && (
                                            <textarea
                                                className="form-control r-n"
                                                rows={3}
                                                defaultValue={form.values.reason}
                                                onChange={(e) => form.update({ reason: e.target.value })}
                                                placeholder="Bericht naar deelnemer"
                                            />
                                        )}
                                    </Fragment>
                                )}
                            </div>
                        )}

                        {form.values.state == 'approved' && (
                            <div className="modal-section modal-section-pad">
                                <div className="modal-heading text-center">Declaratie goedkeuren</div>

                                <div className="modal-text text-center">
                                    Bevestig de declaratie om het bedrag uit te betalen. Voeg indien gewenst een notitie
                                    toe.
                                    <br />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notitie</label>
                                    <textarea
                                        className="form-control r-n"
                                        rows={3}
                                        defaultValue={form.values.note}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                        placeholder="Voeg een persoonlijke notitie toe"></textarea>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" onClick={modal.close} className="button button-default">
                            Annuleer
                        </button>

                        <button
                            type="submit"
                            className="button button-primary"
                            data-dusk="reimbursementResolveSubmit"
                            disabled={form.isLocked}>
                            Bevestig
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
