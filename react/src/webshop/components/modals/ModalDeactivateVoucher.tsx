import React, { useMemo, useState } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import { useVoucherService } from '../../services/VoucherService';
import Voucher from '../../../dashboard/props/models/Voucher';
import InputRadioControl from '../elements/input-radio-control/InputRadioControl';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function ModalDeactivateVoucher({
    modal,
    voucher,
    onDeactivated,
}: {
    modal: ModalState;
    voucher: Voucher;
    onDeactivated: (voucher: Voucher) => void;
}) {
    const translate = useTranslate();

    const reasons = useMemo(
        () => [
            { key: 'moved', value: translate('modal_deactivate_voucher.reasons.moved') },
            { key: 'income_change', value: translate('modal_deactivate_voucher.reasons.income_change') },
            { key: 'not_interested', value: translate('modal_deactivate_voucher.reasons.not_interested') },
            { key: 'other', value: translate('modal_deactivate_voucher.reasons.other') },
        ],
        [translate],
    );

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
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('modal_deactivate_voucher.close')}
                role="button"
            />

            {state == 'reason' && (
                <form className="modal-window form" onSubmit={() => setState('confirmation')}>
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('modal_deactivate_voucher.close')}
                        role="button"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('modal_deactivate_voucher.header_title')}</h2>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-warning">
                                <em className="mdi mdi-alert-outline" />
                            </div>
                            <h2 className="modal-section-title">
                                {translate('modal_deactivate_voucher.stop_participation', {
                                    name: voucher?.fund?.name,
                                })}
                            </h2>
                            <div className="modal-section-space" />
                            <div className="modal-section-space" />
                            <div className="modal-section-notice-pane">
                                <div className="form-label">
                                    {translate('modal_deactivate_voucher.reason_for_stopping')}
                                </div>
                                <div className="form-group">
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
                                            {translate('modal_deactivate_voucher.reason')}
                                        </label>
                                        <textarea
                                            className="form-control r-n"
                                            id="deactivate_voucher_note"
                                            maxLength={140}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                        <div className="form-hint">
                                            {translate('modal_deactivate_voucher.max_characters')}
                                        </div>
                                        <FormError error={form.errors?.note} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="button button-sm button-light" type="button" onClick={modal.close}>
                            {translate('modal_deactivate_voucher.cancel')}
                        </button>
                        <button className="button button-sm button-primary" type="submit" disabled={!reason}>
                            {translate('modal_deactivate_voucher.next')}
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
                        aria-label={translate('modal_deactivate_voucher.close')}
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('modal_deactivate_voucher.header_title')}</h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-warning">
                                <em className="mdi mdi-alert-outline" />
                            </div>
                            <h2 className="modal-section-title">
                                {translate('modal_deactivate_voucher.confirm_stop_participation')}
                            </h2>
                            <div className="modal-section-description">
                                {translate('modal_deactivate_voucher.warning', { name: voucher.fund.name })}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="button button-sm button-light"
                            type="button"
                            onClick={() => setState('reason')}>
                            {translate('modal_deactivate_voucher.back')}
                        </button>
                        <button className="button button-sm button-primary" type="button" onClick={() => form.submit()}>
                            {translate('modal_deactivate_voucher.confirm')}
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
                        aria-label={translate('modal_deactivate_voucher.close')}
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('modal_deactivate_voucher.header_title')}</h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <em className="mdi mdi-check-circle-outline" />
                            </div>
                            <h2 className="modal-section-title">
                                {translate('modal_deactivate_voucher.stop_successful')}
                            </h2>
                            <div className="modal-section-description">
                                {translate('modal_deactivate_voucher.success_message', { name: voucher.fund.name })}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="button button-sm button-light" type="button" onClick={modal.close}>
                            {translate('modal_deactivate_voucher.close')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
