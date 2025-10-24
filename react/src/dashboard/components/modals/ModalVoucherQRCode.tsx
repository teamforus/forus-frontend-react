import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import SponsorVoucher from '../../props/models/Sponsor/SponsorVoucher';
import useVoucherService from '../../services/VoucherService';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import QrCode from '../elements/qr-code/QrCode';
import SelectControl from '../elements/select-control/SelectControl';
import { ResponseError } from '../../props/ApiResponses';
import Organization from '../../props/models/Organization';
import useTranslate from '../../hooks/useTranslate';
import useSetProgress from '../../hooks/useSetProgress';
import VoucherQrCodePrintable from '../../../webshop/components/printable/VoucherQrCodePrintable';
import useOpenPrintable from '../../hooks/useOpenPrintable';
import useAssetUrl from '../../hooks/useAssetUrl';
import Fund from '../../props/models/Fund';
import usePushApiError from '../../hooks/usePushApiError';
import { makeQrCodeContent } from '../../helpers/utils';

export default function ModalVoucherQRCode({
    fund,
    modal,
    onSent,
    voucher,
    className,
    onAssigned,
    organization,
}: {
    fund: Partial<Fund>;
    modal: ModalState;
    onSent: (values: SponsorVoucher) => void;
    voucher: SponsorVoucher;
    className?: string;
    onAssigned: (values: object) => void;
    organization: Organization;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const openPrintable = useOpenPrintable();
    const activeOrganization = useActiveOrganization();

    const voucherService = useVoucherService();

    const [qrCodeValue] = useState<string>(voucher.address);
    const [isActive] = useState<boolean>(voucher.state === 'active');
    const [hasActivationCode] = useState<boolean>(!!voucher.activation_code);
    const [assigning, setAssigning] = useState(!isActive);
    const [success, setSuccess] = useState(false);

    const assignOptions = useMemo(() => {
        return [
            !isActive ? { key: 'activate', label: 'Activeren' } : null,
            !isActive && !hasActivationCode ? { key: 'activation_code', label: 'Create an activation code' } : null,
            { key: 'email', label: 'E-mailadres' },
            organization.bsn_enabled ? { key: 'bsn', label: 'BSN' } : null,
        ].filter((item) => item);
    }, [organization.bsn_enabled, hasActivationCode, isActive]);

    const [assignType, setAssignType] = useState(assignOptions[0]);

    const form = useFormBuilder<{
        bsn?: string;
        email?: string;
    }>(
        {
            bsn: null,
            email: null,
        },
        async (values) => {
            form.setIsLocked(true);
            setProgress(0);

            (assigning ? assignToIdentity(values) : sendToEmail(values.email))
                .then((res) => {
                    onSent(res.data.data);
                    onAssigned(res.data.data);
                    setSuccess(true);
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    form.setIsLocked(false);
                    pushApiError(err);
                })
                .finally(() => {
                    form.setIsLocked(false);
                    setProgress(100);
                });
        },
    );

    const { update: updateForm } = form;

    const goAssigning = useCallback(() => {
        setAssigning(true);

        form.setErrors(null);
        form.update({ bsn: null, email: null });
    }, [form]);

    const goSending = useCallback(() => {
        setAssigning(false);

        form.setErrors(null);
        form.update({ bsn: null, email: null });
    }, [form]);

    const sendToEmail = useCallback(
        (email: string) => {
            return voucherService.sendToEmail(activeOrganization.id, voucher.id, email);
        },
        [activeOrganization.id, voucher.id, voucherService],
    );

    const printQrCode = useCallback(
        (voucher: SponsorVoucher) => {
            openPrintable((printable) => (
                <VoucherQrCodePrintable
                    fund={fund}
                    voucher={voucher}
                    printable={printable}
                    webshopUrl={fund.implementation.url_webshop}
                    organization={organization}
                    assetUrl={assetUrl}
                    showConditions={true}
                />
            ));
        },
        [openPrintable, fund, organization, assetUrl],
    );

    const assignToIdentity = useCallback(
        (query: { email?: string; bsn?: string }) => {
            if (assignType.key === 'email' || assignType.key === 'bsn') {
                return voucherService.assign(activeOrganization.id, voucher.id, {
                    [assignType.key]: query[assignType.key],
                });
            } else if (assignType.key === 'activate') {
                return voucherService.activate(activeOrganization.id, voucher.id);
            } else if (assignType.key === 'activation_code') {
                return voucherService.makeActivationCode(activeOrganization.id, voucher.id);
            }
        },
        [activeOrganization.id, assignType.key, voucher.id, voucherService],
    );

    useEffect(() => {
        if (assignType.key !== 'bsn') {
            updateForm({ bsn: null });
        }

        if (assignType.key !== 'email') {
            updateForm({ email: null });
        }
    }, [assignType.key, updateForm]);

    return (
        <div className={`modal modal-animated modal-voucher_qr ${modal.loading ? 'modal-loading' : ''} ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            {!assigning && !success && (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="voucher_qr-block">
                                <div className="voucher_qr-title">
                                    {translate('modals.modal_voucher_qr_code.title')}
                                </div>

                                <QrCode value={makeQrCodeContent('voucher', qrCodeValue)} />

                                <div className="voucher_qr-actions">
                                    <div className="row">
                                        <div className="col col-lg-6">
                                            <button
                                                type="button"
                                                className="button button-default-dashed button-fill"
                                                onClick={() => printQrCode(voucher)}>
                                                <em className="mdi mdi-printer icon-start" />
                                                <div>{translate('modals.modal_voucher_qr_code.buttons.print')}</div>
                                            </button>
                                        </div>
                                        <div className="col col-lg-6">
                                            <button
                                                type="button"
                                                className="button button-default-dashed button-fill"
                                                onClick={goAssigning}>
                                                <em className="mdi mdi-email icon-start" />
                                                <div>{translate('modals.modal_voucher_qr_code.buttons.assign')}</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="form">
                                <div className="form-group">
                                    <div className="row">
                                        <div className="col col-lg-12">
                                            <div className="form-label form-label-required">
                                                {translate('modals.modal_voucher_qr_code.labels.sent_to_email')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col col-lg-9">
                                            <input
                                                className="form-control"
                                                type={'text'}
                                                value={form.values.email || ''}
                                                placeholder={translate(
                                                    'modals.modal_voucher_qr_code.placeholders.email',
                                                )}
                                                onChange={(e) => form.update({ email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col col-lg-3">
                                            <button type="submit" className="button button-primary button-fill">
                                                {translate('modals.modal_voucher_qr_code.buttons.send')}
                                            </button>
                                        </div>
                                    </div>
                                    <FormError error={form.errors?.email} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-default" onClick={modal.close}>
                            {translate('modals.modal_voucher_qr_code.buttons.close')}
                        </button>
                    </div>
                </form>
            )}

            {assigning && !success && (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="voucher_qr-title">{translate('modals.modal_voucher_qr_code.title_assign')}</div>
                    </div>

                    <div className="modal-body modal-body-visible">
                        <div className="modal-section">
                            <div className="form">
                                <div className="form-group">
                                    <div className="form-label">
                                        {translate(
                                            'modals.modal_voucher_create.labels.assign_by_type' +
                                                (isActive ? '' : '_or_activate'),
                                        )}
                                    </div>
                                    <SelectControl
                                        className="form-control"
                                        propValue={'label'}
                                        options={assignOptions}
                                        value={assignType}
                                        allowSearch={false}
                                        onChange={setAssignType}
                                    />
                                    <FormError error={form.errors?.assign_by_type} />
                                </div>

                                {assignType.key === 'email' && (
                                    <div className="form-group">
                                        <div className="form-label form-label-required">
                                            {translate('modals.modal_voucher_qr_code.labels.assign_to_identity')}
                                        </div>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={form.values.email || ''}
                                            placeholder={translate(`modals.modal_voucher_qr_code.placeholders.email`)}
                                            onChange={(e) => form.update({ email: e.target.value })}
                                        />
                                        <FormError error={form.errors?.email} />
                                    </div>
                                )}

                                {assignType.key === 'bsn' && (
                                    <div className="form-group">
                                        <div className="form-label form-label-required">
                                            {translate('modals.modal_voucher_qr_code.labels.assign_to_identity')}
                                        </div>
                                        <input
                                            className="form-control"
                                            value={form.values.bsn || ''}
                                            placeholder={translate(`modals.modal_voucher_qr_code.placeholders.bsn`)}
                                            onChange={(e) => form.update({ bsn: e.target.value })}
                                        />
                                        <FormError error={form.errors?.bsn} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="form">
                                <div className="block block-info">
                                    <em className="mdi mdi-information block-info-icon" />
                                    {translate('modals.modal_voucher_qr_code.info_assign')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button
                            type="button"
                            className="button button-default"
                            onClick={isActive ? goSending : modal.close}>
                            {translate('modals.modal_voucher_qr_code.buttons.cancel')}
                        </button>

                        {assignType.key === 'activate' && (
                            <button type="submit" className="button button-primary">
                                {translate('modals.modal_voucher_create.buttons.activate')}
                            </button>
                        )}

                        {assignType.key !== 'activate' && (
                            <button type="submit" className="button button-primary">
                                {translate('modals.modal_voucher_create.buttons.submit')}
                            </button>
                        )}
                    </div>
                </form>
            )}

            {success && (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-body">
                        <div className="modal-section">
                            {assigning && (assignType.key === 'email' || assignType.key === 'bsn') && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {translate('modals.modal_voucher_qr_code.success.assigned_title')}
                                    </div>
                                    <div className="message-details">
                                        {translate('modals.modal_voucher_qr_code.success.assigned_details')}
                                    </div>
                                </div>
                            )}

                            {assigning && assignType.key === 'activate' && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {translate('modals.modal_voucher_qr_code.success.activated_title')}
                                    </div>
                                    <div className="message-details">
                                        {translate('modals.modal_voucher_qr_code.success.activated_details')}
                                    </div>
                                </div>
                            )}

                            {assigning && assignType.key === 'activation_code' && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {translate('modals.modal_voucher_qr_code.success.activation_code_title')}
                                    </div>
                                    <div className="message-details">
                                        {translate('modals.modal_voucher_qr_code.success.activation_code_details')}
                                    </div>
                                </div>
                            )}

                            {!assigning && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {translate('modals.modal_voucher_qr_code.success.sending_title')}
                                    </div>
                                    <div className="message-details">
                                        {translate('modals.modal_voucher_qr_code.success.sending_details')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-primary" onClick={modal.close}>
                            {translate('modals.modal_voucher_qr_code.buttons.close')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
