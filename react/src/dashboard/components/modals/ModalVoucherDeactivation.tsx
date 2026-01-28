import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import SponsorVoucher from '../../props/models/Sponsor/SponsorVoucher';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDangerZone from './ModalDangerZone';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';

export default function ModalVoucherDeactivation({
    modal,
    voucher,
    onSubmit,
    className,
}: {
    modal: ModalState;
    voucher: SponsorVoucher;
    onSubmit: (values: object) => void;
    className?: string;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const [hasEmail] = useState<boolean>(!!voucher.identity_email);
    const [hideModal, setHideModal] = useState(false);

    const form = useFormBuilder(
        {
            note: '',
            notify_by_email: false,
        },
        async (values) => {
            const transData = { fund_name: voucher.fund.name, email: voucher.identity_email };

            const descNoEmail = translate(
                'modals.modal_voucher_deactivation.danger_zone.description_no_email',
                transData,
            );

            const descNotification = translate(
                'modals.modal_voucher_deactivation.danger_zone.description_notification',
                transData,
            );

            const descNotificationEmail = translate(
                'modals.modal_voucher_deactivation.danger_zone.description_notification_email',
                transData,
            );

            const description = hasEmail
                ? values.notify_by_email
                    ? descNotification + descNotificationEmail
                    : descNotification
                : descNoEmail;

            const { close: closeModal } = modal;

            setHideModal(true);

            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate(`modals.modal_voucher_deactivation.danger_zone.title`, transData)}
                    description_text={description}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => {
                            setHideModal(false);
                            form.setIsLocked(false);
                            modal.close();
                        },
                    }}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            onSubmit(values);
                            setHideModal(false);
                            modal.close();
                            closeModal();
                        },
                    }}
                />
            ));
        },
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-md',
                'modal-animated',
                (modal.loading || hideModal) && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon modal-icon-primary">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">{translate('modals.modal_voucher_deactivation.title')}</div>
                            <div className="modal-text">
                                {translate('modals.modal_voucher_deactivation.description')}
                            </div>
                            <span />
                        </div>

                        <FormGroup
                            label={translate('modals.modal_voucher_deactivation.labels.note')}
                            hint={translate('modals.modal_voucher_activation.hints.note')}
                            error={form.errors?.note}
                            input={(id) => (
                                <textarea
                                    className="form-control r-n"
                                    id={id}
                                    maxLength={140}
                                    value={form.values.note || ''}
                                    placeholder={translate('modals.modal_voucher_deactivation.placeholders.note')}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                />
                            )}
                        />

                        {hasEmail && (
                            <FormGroup
                                input={() => (
                                    <CheckboxControl
                                        title={'Informeer de gebruiker via een e-mailbericht.'}
                                        checked={form.values.notify_by_email || false}
                                        onChange={(e) => form.update({ notify_by_email: e.target.checked })}
                                    />
                                )}
                            />
                        )}
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_voucher_deactivation.buttons.cancel')}
                    </button>

                    <button type="submit" className="button button-primary" disabled={form.values.note.length > 140}>
                        {translate('modals.modal_voucher_deactivation.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
