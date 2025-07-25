import React, { useMemo } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import classNames from 'classnames';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormGroup from '../elements/forms/elements/FormGroup';
import Reservation from '../../props/models/Reservation';
import { runSequentially } from '../../helpers/utils';
import Organization from '../../props/models/Organization';
import useProductReservationService from '../../services/ProductReservationService';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { ResponseError } from '../../props/ApiResponses';

export default function ModalReservationReject({
    modal,
    onDone,
    organization,
    reservations,
}: {
    modal: ModalState;
    onDone?: () => void;
    organization: Organization;
    reservations: Reservation[];
}) {
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const productReservationService = useProductReservationService();

    const title = useMemo(() => {
        return reservations.length > 1
            ? 'Weet u zeker dat u de betalingen wilt annuleren?'
            : 'Weet u zeker dat u de betaling wilt annuleren?';
    }, [reservations.length]);

    const description = useMemo(() => {
        if (reservations.length > 1) {
            const intro =
                'Wanneer u de betalingen annuleert wordt u niet meer uitbetaald voor de volgende reserveringen:';
            const list = reservations.map((r) => `- ${r.product!.name} voor ${r.amount_locale}`).join('\n');

            return [intro, list].join('\n\n');
        }

        return 'Wanneer u de betaling annuleert wordt u niet meer uitbetaald.';
    }, [reservations]);

    const form = useFormBuilder<{ note: string; share_note_by_email: boolean }>(
        {
            note: '',
            share_note_by_email: false,
        },
        (values) => {
            const total = reservations.length;
            const isSingle = total === 1;

            const tasks = reservations.map(
                (reservation, idx) => () =>
                    productReservationService.reject(organization.id, reservation.id, values).then(() => {
                        const prefix = isSingle ? '' : `${idx + 1}/${total}: `;

                        pushSuccess(
                            `${prefix}Reservering voor ${reservation.product!.name} voor ${reservation.amount_locale} geannuleerd.`,
                        );
                    }),
            );

            runSequentially(tasks)
                .then(() => {
                    if (isSingle) {
                        pushSuccess('Opgeslagen!');
                    } else {
                        pushSuccess('Alle reserveringen zijn geannuleerd.');
                    }

                    onDone?.();
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err?.data?.errors);
                    form.setIsLocked(false);
                    pushApiError(err);
                });
        },
    );

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="block block-danger_zone">
                            <div className="danger_zone-title">
                                <em className="mdi mdi-alert" />
                                {title}
                            </div>
                        </div>

                        <div className="modal-text">
                            {description
                                .split('\n')
                                .map((value: string, index: number) =>
                                    value ? <div key={index}>{value}</div> : <div key={index}>&nbsp;</div>,
                                )}
                        </div>

                        <FormGroup
                            label="Notitie"
                            error={form.errors.note}
                            input={(id) => (
                                <textarea
                                    id={id}
                                    className="form-control r-n"
                                    rows={3}
                                    defaultValue={form.values.note}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                    placeholder="Notitie"
                                />
                            )}
                        />

                        <FormGroup
                            error={form.errors.share_note_by_email}
                            input={() => (
                                <label className="checkbox checkbox-narrow">
                                    <input
                                        type="checkbox"
                                        checked={form.values.share_note_by_email}
                                        onChange={(e) => form.update({ share_note_by_email: e.target.checked })}
                                        hidden={true}
                                    />
                                    <div className="checkbox-label">
                                        <div className="checkbox-box">
                                            <div className="mdi mdi-check" />
                                        </div>
                                        <span>Verstuur een bericht naar de inwoner</span>
                                    </div>
                                </label>
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <ModalButton type="default" button={{ onClick: modal.close }} text={'Annuleren'} />
                    <ModalButton type="primary" button={{ onClick: form.submit }} text={'Bevestigen'} />
                </div>
            </div>
        </div>
    );
}
