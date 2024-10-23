import React, { useState } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import { useVoucherService } from '../../services/VoucherService';
import Voucher from '../../../dashboard/props/models/Voucher';
import InputRadioControl from '../elements/input-radio-control/InputRadioControl';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalDeactivateVoucher({
    modal,
    voucher,
    onDeactivated,
}: {
    modal: ModalState;
    voucher: Voucher;
    onDeactivated: (voucher: Voucher) => void;
}) {
    const [reasons] = useState([
        { key: 'moved', value: 'Verhuizing' },
        { key: 'income_change', value: 'Verandering in inkomen' },
        { key: 'not_interested', value: 'Aanbod is niet aantrekkelijk' },
        { key: 'other', value: 'Anders' },
    ]);

    const [note, setNote] = useState('');
    const [reason, setReason] = useState(null);

    const [state, setState] = useState<'reason' | 'confirmation' | 'success'>('reason');

    const voucherService = useVoucherService();

    const form = useFormBuilder({}, () => {
        voucherService
            .deactivate(voucher.number, { note: reason?.key === 'other' ? note : reason.value })
            .then((res) => {
                onDeactivated(res.data.data);
                setState('success');
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data.errors);
                setState('reason');
            })
            .finally(() => form.setIsLocked(false));
    });

    return (
        <div className={`modal modal-animated  ${modal.loading ? '' : 'modal-loaded'}`} role="dialog">
            <div className="modal-backdrop" onClick={modal.close} aria-label="Sluiten" role="button" />

            {state == 'reason' && (
                <form className="modal-window form" onSubmit={() => setState('confirmation')}>
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label="Sluiten"
                        role="button"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title">Deelname stoppen</h2>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-warning">
                                <em className="mdi mdi-alert-outline" />
                            </div>
                            <h2 className="modal-section-title">Je {voucher?.fund?.name} deelname stoppen.</h2>
                            <div className="modal-section-space" />
                            <div className="modal-section-space" />
                            <div className="modal-section-notice-pane">
                                <div className="form-label">Reden van stoppen:</div>
                                <div className="form-group form-group-inline">
                                    {reasons?.map((item) => (
                                        <InputRadioControl
                                            key={item.key}
                                            fill={true}
                                            compact={true}
                                            label={item.value}
                                            value={item.key}
                                            checked={item.key == reason?.key}
                                            onChange={(e) => {
                                                setReason(reasons.find((item) => item.key == e.currentTarget.value));
                                            }}
                                        />
                                    ))}
                                </div>

                                {reason?.key == 'other' && (
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="deactivate_voucher_note">
                                            Reden
                                        </label>
                                        <textarea
                                            className="form-control r-n"
                                            id="deactivate_voucher_note"
                                            maxLength={140}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                        <div className="form-hint">Max. 140 tekens</div>
                                        <FormError error={form.errors?.note} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="button button-sm button-light" type="button" onClick={modal.close}>
                            Annuleer
                        </button>
                        <button className="button button-sm button-primary" type="submit" disabled={!reason}>
                            Volgende
                        </button>
                    </div>
                </form>
            )}

            {state == 'confirmation' && (
                <form className="modal-window" onSubmit={form.submit}>
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        onKeyDown={clickOnKeyEnter}
                        tabIndex={0}
                        aria-label="Sluiten"
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">Deelname stoppen</h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-warning">
                                <em className="mdi mdi-alert-outline" />
                            </div>
                            <h2 className="modal-section-title">Weet u zeker dat u uw deelname wilt stoppen?</h2>
                            <div className="modal-section-description">
                                Let op: Je kunt hierna geen gebruik meer maken van je tegoed. Je {voucher.fund.name}{' '}
                                tegoed wordt gedeactiveerd.
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="button button-sm button-light"
                            type="button"
                            onClick={() => setState('reason')}>
                            Terug
                        </button>
                        <button className="button button-sm button-primary" type="button" onClick={() => form.submit()}>
                            Bevestigen
                        </button>
                    </div>
                </form>
            )}

            {state == 'success' && (
                <div className="modal-window">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label="Sluiten"
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">Deelname stoppen</h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <em className="mdi mdi-check-circle-outline" />
                            </div>
                            <h2 className="modal-section-title">Deelname gestopt</h2>
                            <div className="modal-section-description">Je {voucher.fund.name} deelname is gestopt.</div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="button button-sm button-light" type="button" onClick={modal.close}>
                            Sluiten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
