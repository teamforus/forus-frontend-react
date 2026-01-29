import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import SponsorVoucher from '../../props/models/Sponsor/SponsorVoucher';
import useTranslate from '../../hooks/useTranslate';
import FormGroup from '../elements/forms/elements/FormGroup';

export default function ModalVoucherActivate({
    modal,
    className,
    voucher,
    onSubmit,
}: {
    modal: ModalState;
    className?: string;
    voucher: SponsorVoucher;
    onSubmit: (values: object) => void;
}) {
    const translate = useTranslate();

    const form = useFormBuilder({ note: '' }, async (values) => {
        onSubmit(values);
        modal.close();
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon modal-icon-primary">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body form">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">{translate('modals.modal_voucher_activation.title')}</div>
                            <div className="modal-text">{translate('modals.modal_voucher_activation.description')}</div>
                            <span />
                        </div>

                        <FormGroup
                            label={translate('modals.modal_voucher_activation.labels.note')}
                            hint={translate('modals.modal_voucher_activation.hints.note')}
                            error={form.errors?.note}
                            input={(id) => (
                                <textarea
                                    className="form-control r-n"
                                    id={id}
                                    maxLength={140}
                                    value={form.values.note}
                                    placeholder={translate('modals.modal_voucher_activation.placeholders.note')}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_voucher_activation.buttons.cancel')}
                    </button>

                    <button type="submit" className="button button-primary" disabled={form.values.note.length > 140}>
                        {voucher.state === 'pending'
                            ? translate('modals.modal_voucher_activation.buttons.submit_activate')
                            : translate('modals.modal_voucher_activation.buttons.submit_reactivate')}
                    </button>
                </div>
            </form>
        </div>
    );
}
