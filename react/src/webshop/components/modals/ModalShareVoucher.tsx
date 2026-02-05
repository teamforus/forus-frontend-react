import React from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import { useVoucherService } from '../../services/VoucherService';
import ModalNotification from './ModalNotification';
import Voucher from '../../../dashboard/props/models/Voucher';
import { clickOnKeyEnter, clickOnKeyEnterOrSpace } from '../../../dashboard/helpers/wcag';

export default function ModalShareVoucher({ modal, voucher }: { modal: ModalState; voucher: Voucher }) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const voucherService = useVoucherService();

    const shareVoucherForm = useFormBuilder(
        {
            reason: '',
            notify_by_email: false,
        },
        (values) => {
            voucherService
                .shareVoucher(voucher.number, values)
                .then(() => {
                    modal.close();

                    openModal((modal) => (
                        <ModalNotification
                            modal={modal}
                            type={'action-result'}
                            title={translate('voucher.share_voucher.popup_sent.title_modal')}
                            header={translate('voucher.share_voucher.popup_sent.title')}
                            mdiIconType={'success'}
                            mdiIconClass={'check-circle-outline'}
                            description={translate('voucher.share_voucher.popup_sent.description')}
                            confirmBtnText={translate('voucher.share_voucher.buttons.confirm')}
                        />
                    ));
                })
                .catch((err: ResponseError) => {
                    shareVoucherForm.setIsLocked(false);
                    shareVoucherForm.setErrors(err.data.errors);
                });
        },
    );

    return (
        <div className={classNames('modal', 'modal-animated', !modal.loading && 'modal-loaded')} role="dialog">
            <div
                className="modal-backdrop"
                onClick={modal.close}
                aria-label={translate('voucher.share_voucher.close')}
                role="button"
            />

            <div className="modal-window">
                <form className="form" onSubmit={shareVoucherForm.submit}>
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('voucher.share_voucher.close')}
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">
                            {translate('voucher.share_voucher.popup_sent.title_modal')}
                        </h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-primary">
                                <div className="mdi mdi-share-variant-outline" />
                            </div>
                            <h2 className="modal-section-title" id="shareVoucherDialogTitle">
                                {translate('voucher.share_voucher.popup_form.title')}
                            </h2>
                            <div className="modal-section-description" id="shareVoucherDialogSubtitle">
                                {translate('voucher.share_voucher.popup_form.description')}
                            </div>
                            <div className="modal-section-space" />
                            <div className="modal-section-space" />
                            <div className="modal-section-notice-pane">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="share_note">
                                        {translate('voucher.share_voucher.labels.share_note')}
                                    </label>
                                    <textarea
                                        id="share_note"
                                        className="form-control"
                                        value={shareVoucherForm.values.reason}
                                        onChange={(e) => shareVoucherForm.update({ reason: e.target.value })}
                                    />
                                    <FormError error={shareVoucherForm.errors.reason} />
                                </div>
                                <div className="form-group">
                                    <label
                                        className="checkbox"
                                        htmlFor="send_copy"
                                        role="checkbox"
                                        aria-checked={shareVoucherForm.values.notify_by_email}>
                                        <input
                                            id="send_copy"
                                            type="checkbox"
                                            checked={shareVoucherForm.values.notify_by_email}
                                            onChange={(e) => {
                                                shareVoucherForm.update({ notify_by_email: e.target.checked });
                                            }}
                                            tabIndex={-1}
                                            aria-hidden="true"
                                        />
                                        <div className="checkbox-label">
                                            <div
                                                className="checkbox-box"
                                                tabIndex={0}
                                                onKeyDown={clickOnKeyEnterOrSpace}>
                                                <em className="mdi mdi-check" />
                                            </div>
                                            {translate('voucher.share_voucher.labels.send_copy')}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="button button-light button-sm show-sm flex-grow"
                            type="button"
                            onClick={modal.close}>
                            {translate('voucher.share_voucher.buttons.cancel')}
                        </button>

                        <button className="button button-primary button-sm show-sm flex-grow" type="submit">
                            {translate('voucher.share_voucher.buttons.submit')}
                        </button>

                        <div className="flex flex-grow hide-sm">
                            <button className="button button-light button-sm" type="button" onClick={modal.close}>
                                {translate('voucher.share_voucher.buttons.cancel')}
                            </button>
                        </div>

                        <div className="flex hide-sm">
                            <button type="submit" className="button button-primary button-sm">
                                {translate('voucher.share_voucher.buttons.submit')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
