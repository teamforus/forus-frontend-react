import React, { useCallback, useState } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import Voucher from '../../../dashboard/props/models/Voucher';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import { usePhysicalCardsService } from '../../services/PhysicalCardsService';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import { usePhysicalCardsRequestService } from '../../services/PhysicalCardsRequestService';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import PincodeControl from '../../../dashboard/components/elements/forms/controls/PincodeControl';
import TranslateHtml from '../../../dashboard/components/elements/translate-html/TranslateHtml';
import EmailProviderLink from '../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import useEnvData from '../../hooks/useEnvData';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useAssetUrl from '../../hooks/useAssetUrl';
import { InlineFundPhysicalCardType } from '../../../dashboard/props/models/Fund';
import useIsMobile from '../../hooks/useIsMobile';
import { SimpleNativePinCodeControl } from '../elements/forms/SimpleNativePinCodeControl';

export default function ModalPhysicalCardType({
    modal,
    voucher = null,
    fundCardType,
    initialState = 'select_type',
    onSendVoucherEmail = null,
    onOpenInMeModal = null,
    onPrintQrCode = null,
    onAttached,
}: {
    modal: ModalState;
    voucher: Voucher;
    fundCardType: InlineFundPhysicalCardType;
    initialState: 'select_type' | 'card_code';
    onSendVoucherEmail?: (voucher: Voucher) => void;
    onOpenInMeModal?: () => void;
    onPrintQrCode?: (voucher: Voucher) => void;
    onAttached?: () => void;
}) {
    const typeCard = fundCardType?.physical_card_type;
    const isMobile = useIsMobile(600);

    const envData = useEnvData();
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const authIdentity = useAuthIdentity();

    const physicalCardsService = usePhysicalCardsService();
    const physicalCardsRequestService = usePhysicalCardsRequestService();

    const [state, setState] = useState<
        'select_type' | 'success_old_card' | 'success_new_card' | 'card_code' | 'confirm_new_card'
    >(initialState);
    const [prefersPlasticCard, setPrefersPlasticCard] = useState(true);

    const useNativePincode = isMobile && typeCard?.code_block_size * typeCard?.code_blocks > 10;

    const sendVoucherEmail = useCallback(() => {
        modal.close();
        onSendVoucherEmail?.(voucher);
    }, [modal, onSendVoucherEmail, voucher]);

    const openInMeModal = useCallback(() => {
        modal.close();
        onOpenInMeModal?.();
    }, [modal, onOpenInMeModal]);

    const printQrCode = useCallback(() => {
        modal.close();
        onPrintQrCode?.(voucher);
    }, [modal, onPrintQrCode, voucher]);

    const activateCodeForm = useFormBuilder<{
        code?: string;
        fund_physical_card_type_id?: number;
    }>(
        {
            code: typeCard?.code_prefix,
            fund_physical_card_type_id: fundCardType?.id,
        },
        (values) => {
            physicalCardsService
                .store(voucher.number, values)
                .then(() => {
                    setState('success_old_card');
                    onAttached?.();
                })
                .catch((err: ResponseError) => {
                    if (err.status === 429) {
                        return activateCodeForm.setErrors({ code: [err.data.message] });
                    }

                    activateCodeForm.setErrors(err.data.errors);
                })
                .finally(() => activateCodeForm.setIsLocked(false));
        },
    );

    const requestPhysicalCardForm = useFormBuilder<{
        address?: string;
        house?: string;
        house_addition?: string;
        postcode?: string;
        city?: string;
        fund_physical_card_type_id?: number;
    }>(
        {
            address: '',
            house: '',
            house_addition: '',
            postcode: '',
            city: '',
            fund_physical_card_type_id: fundCardType?.id,
        },
        (values) => {
            physicalCardsRequestService
                .store(voucher.number, values)
                .then(() => setState('success_new_card'))
                .catch((err: ResponseError) => {
                    setState('select_type');
                    requestPhysicalCardForm.setErrors(err.data.errors);

                    if (err.status === 429) {
                        requestPhysicalCardForm.setErrors({
                            to_many_requests: [err.data.message],
                        });
                    }
                })
                .finally(() => requestPhysicalCardForm.setIsLocked(false));
        },
    );

    const addressPreview = useCallback(() => {
        const { address, house, house_addition, postcode, city } = requestPhysicalCardForm.values;

        return [
            [address, house, house_addition].filter((value) => value).join(' '),
            [postcode, city].filter((value) => value).join(' '),
        ];
    }, [requestPhysicalCardForm.values]);

    const updateRequestPhysicalCardForm = requestPhysicalCardForm.update;

    const preferPlasticCard = useCallback(() => {
        physicalCardsRequestService.index(voucher.number).then((res) => {
            updateRequestPhysicalCardForm(res.data.data[0] || {});
            setPrefersPlasticCard(true);
            setState('select_type');
        });
    }, [physicalCardsRequestService, updateRequestPhysicalCardForm, voucher?.number]);

    const requestPhysicalCard = useCallback(() => {
        preferPlasticCard();
    }, [preferPlasticCard]);

    const requestCard = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();

            physicalCardsRequestService
                .validate(voucher.number, requestPhysicalCardForm.values)
                .then(() => {
                    requestPhysicalCardForm.errors = {};
                    setState('confirm_new_card');
                })
                .catch((err: ResponseError) => {
                    requestPhysicalCardForm.setIsLocked(false);
                    requestPhysicalCardForm.setErrors(err.data.errors);
                });
        },
        [physicalCardsRequestService, requestPhysicalCardForm, voucher?.number],
    );

    const confirmCard = useCallback(() => {
        requestPhysicalCardForm.submit();
    }, [requestPhysicalCardForm]);

    return (
        <div className={`modal modal-animated modal-physical-cards ${modal.loading ? '' : 'modal-loaded'}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            {state == 'card_code' && (
                <form className="modal-window form form-compact" onSubmit={activateCodeForm.submit}>
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('modal_physical_card.buttons.close')}
                        role="button"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title" id="physicalCardTypeDialogTitle">
                            {translate('modal_physical_card.modal_section.link_card.title')}
                        </h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon">
                                <img
                                    src={
                                        typeCard?.photo?.sizes?.thumbnail ||
                                        assetUrl('/assets/img/placeholders/physical-card-type.svg')
                                    }
                                    style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }}
                                    alt={translate('modal_physical_card.modal_section.link_card.alt_text', {
                                        fund_name: voucher.fund.name,
                                    })}
                                />
                            </div>
                            <div className="modal-section-title" id="physicalCardTypeDialogSubtitle">
                                {translate('modal_physical_card.modal_section.link_card.subtitle')}
                            </div>
                            <div className="modal-section-description">
                                <TranslateHtml
                                    i18n={translate('modal_physical_card.modal_section.link_card.description')}
                                />
                            </div>
                            <div className="modal-section-space" />

                            {fundCardType?.allow_physical_card_requests && (
                                <div className="modal-section-description">
                                    {translate('modal_physical_card.modal_section.link_card.no_old_card')}{' '}
                                    <strong className={'clickable'} onClick={() => requestPhysicalCard()}>
                                        {translate('modal_physical_card.modal_section.link_card.order_card')}
                                    </strong>
                                </div>
                            )}

                            <div className="modal-section-space" />

                            {useNativePincode ? (
                                <SimpleNativePinCodeControl
                                    className="form-control text-center text-strong"
                                    autoFocus={true}
                                    value={activateCodeForm.values.code}
                                    onChange={(code) => activateCodeForm.update({ code: code.trim() })}
                                    blockSize={typeCard?.code_block_size}
                                    blockCount={typeCard?.code_blocks}
                                    valueType={'num'}
                                    cantDeleteSize={typeCard?.code_prefix?.length || 0}
                                    ariaLabel={translate(
                                        'modal_physical_card.modal_section.link_card.enter_physical_card_number',
                                    )}
                                />
                            ) : (
                                <PincodeControl
                                    className="block-pincode-phone"
                                    value={activateCodeForm.values.code}
                                    onChange={(code) => activateCodeForm.update({ code: code.trim() })}
                                    blockSize={typeCard?.code_block_size}
                                    blockCount={typeCard?.code_blocks}
                                    valueType={'num'}
                                    cantDeleteSize={typeCard?.code_prefix?.length || 0}
                                    ariaLabel={translate(
                                        'modal_physical_card.modal_section.link_card.enter_physical_card_number',
                                    )}
                                />
                            )}

                            <FormError className={'text-center'} error={activateCodeForm.errors?.code} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="button button-sm button-primary"
                            disabled={
                                activateCodeForm.values.code.length != typeCard?.code_block_size * typeCard?.code_blocks
                            }
                            onClick={() => activateCodeForm.submit()}
                            type="button">
                            {translate('modal_physical_card.buttons.link_card.submit_code')}
                        </button>
                    </div>
                </form>
            )}

            {state == 'select_type' && (
                <form className="modal-window form form-compact" onSubmit={requestCard}>
                    <div className={'modal-header'}>
                        <div
                            className="modal-close mdi mdi-close"
                            onClick={modal.close}
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            aria-label={translate('modal_physical_card.buttons.close')}
                            role="button"
                        />
                        <h2 className="modal-header-title" id="physicalCardTypeDialogTitle">
                            {preferPlasticCard
                                ? translate('modal_physical_card.modal_section.request_new_card.title', {
                                      fund_name: voucher.fund.name,
                                  })
                                : translate('modal_physical_card.modal_section.type_selection.title', {
                                      fund_name: voucher.fund.name,
                                  })}
                        </h2>
                    </div>
                    <div className="modal-body">
                        {!prefersPlasticCard && (
                            <div className="modal-section">
                                <div className="physical-card">
                                    <div className="physical-card-row">
                                        <div
                                            className="physical-card-item physical-card-item-sm"
                                            onClick={() => sendVoucherEmail()}>
                                            <div className="physical-card-item-inner">
                                                <div className="physical-card-item-icon">
                                                    <em className="mdi mdi-email-outline" />
                                                </div>
                                                <div className="physical-card-item-title">
                                                    {translate(
                                                        'modal_physical_card.modal_section.request_new_card.email_to_me',
                                                    )}
                                                </div>
                                            </div>
                                            <div className="physical-card-item-details">
                                                <div className="physical-card-item-title">
                                                    {translate(
                                                        'modal_physical_card.modal_section.request_new_card.email_to_me',
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {!envData.config?.flags?.noPrintOption && (
                                            <div
                                                onClick={printQrCode}
                                                className="physical-card-item physical-card-item-sm">
                                                <div className="physical-card-item-inner">
                                                    <div className="physical-card-item-icon">
                                                        <em className="mdi mdi-printer" />
                                                    </div>
                                                    <div className="physical-card-item-title">
                                                        {translate(
                                                            'modal_physical_card.modal_section.request_new_card.print_pass',
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="physical-card-item-details">
                                                    <div className="physical-card-item-title">
                                                        {translate(
                                                            'modal_physical_card.modal_section.request_new_card.print_pass',
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className="physical-card-item physical-card-item-sm"
                                            onClick={openInMeModal}>
                                            <div className="physical-card-item-inner">
                                                <div className="physical-card-item-icon">
                                                    <em className="mdi mdi-account-circle" />
                                                </div>
                                                <div className="physical-card-item-title">
                                                    {translate(
                                                        'modal_physical_card.modal_section.request_new_card.open_in_app',
                                                    )}
                                                </div>
                                            </div>
                                            <div className="physical-card-item-details">
                                                <div className="physical-card-item-title">
                                                    {translate(
                                                        'modal_physical_card.modal_section.request_new_card.open_in_app',
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {!prefersPlasticCard &&
                                            voucher?.fund.allow_physical_cards &&
                                            voucher?.type === 'regular' &&
                                            !voucher?.physical_card && (
                                                <div
                                                    className="physical-card-item physical-card-item-sm"
                                                    onClick={preferPlasticCard}>
                                                    <div className="physical-card-item-inner">
                                                        <div className="physical-card-item-icon">
                                                            <em className="mdi mdi-email-newsletter" />
                                                        </div>

                                                        <div className="physical-card-item-title">
                                                            {translate(
                                                                'modal_physical_card.modal_section.type_selection.card_new.title',
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="physical-card-item-details">
                                                        <div className="physical-card-item-title">
                                                            {translate(
                                                                'modal_physical_card.modal_section.type_selection.card_new.title',
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-section">
                            <div className="modal-section-icon">
                                <img
                                    src={
                                        typeCard?.photo?.sizes?.thumbnail ||
                                        assetUrl('/assets/img/placeholders/physical-card-type.svg')
                                    }
                                    style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }}
                                    alt={translate('modal_physical_card.modal_section.link_card.alt_text', {
                                        fund_name: voucher.fund.name,
                                    })}
                                />
                            </div>
                            <div className="modal-section-title">
                                {translate('modal_physical_card.modal_section.request_new_card.title')}
                            </div>
                            <div className="modal-section-description">
                                {translate('modal_physical_card.modal_section.request_new_card.description')}
                            </div>
                        </div>

                        {prefersPlasticCard && (
                            <div className="modal-section">
                                <div className="row">
                                    <div className="form-group col col-xs-12 col-xl-12">
                                        <label
                                            className="form-label"
                                            htmlFor="modal_physical_card.modal_section.request_new_card.address">
                                            {translate('modal_physical_card.modal_section.request_new_card.address')}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="modal_physical_card.modal_section.request_new_card.address"
                                            value={requestPhysicalCardForm.values.address}
                                            onChange={(e) => {
                                                requestPhysicalCardForm.update({ address: e.target.value });
                                            }}
                                            autoComplete="address-line1"
                                            aria-label={translate(
                                                'modal_physical_card.modal_section.request_new_card.address',
                                            )}
                                        />
                                        <FormError error={requestPhysicalCardForm.errors?.address} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group col col-xs-12 col-lg-6">
                                        <label
                                            className="form-label"
                                            htmlFor="modal_physical_card.modal_section.request_new_card.house">
                                            {translate('modal_physical_card.modal_section.request_new_card.house')}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="modal_physical_card.modal_section.request_new_card.house"
                                            value={requestPhysicalCardForm.values.house}
                                            onChange={(e) => {
                                                requestPhysicalCardForm.update({ house: e.target.value });
                                            }}
                                            autoComplete="address-line2"
                                            aria-label={translate(
                                                'modal_physical_card.modal_section.request_new_card.house',
                                            )}
                                        />
                                        <FormError error={requestPhysicalCardForm.errors?.house} />
                                    </div>
                                    <div className="form-group col col-xs-12 col-lg-6">
                                        <label
                                            className="form-label"
                                            htmlFor="modal_physical_card.modal_section.request_new_card.house_addition">
                                            {translate(
                                                'modal_physical_card.modal_section.request_new_card.house_addition',
                                            )}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="modal_physical_card.modal_section.request_new_card.house_addition"
                                            value={requestPhysicalCardForm.values.house_addition}
                                            onChange={(e) => {
                                                requestPhysicalCardForm.update({ house_addition: e.target.value });
                                            }}
                                            autoComplete="address-line3"
                                            aria-label={translate(
                                                'modal_physical_card.modal_section.request_new_card.house_addition',
                                            )}
                                        />
                                        <FormError error={requestPhysicalCardForm.errors?.house_addition} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group col col-xs-12 col-lg-6">
                                        <label
                                            className="form-label"
                                            htmlFor="modal_physical_card.modal_section.request_new_card.postcode">
                                            {translate('modal_physical_card.modal_section.request_new_card.postcode')}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="modal_physical_card.modal_section.request_new_card.postcode"
                                            value={requestPhysicalCardForm.values.postcode}
                                            onChange={(e) => {
                                                requestPhysicalCardForm.update({ postcode: e.target.value });
                                            }}
                                            autoComplete="postal-code"
                                            aria-label={translate(
                                                'modal_physical_card.modal_section.request_new_card.postcode',
                                            )}
                                        />
                                        <FormError error={requestPhysicalCardForm.errors?.postcode} />
                                    </div>
                                    <div className="form-group col col-xs-12 col-lg-6">
                                        <label
                                            className="form-label"
                                            htmlFor="modal_physical_card.modal_section.request_new_card.city">
                                            {translate('modal_physical_card.modal_section.request_new_card.city')}
                                        </label>
                                        <input
                                            className="form-control"
                                            id="modal_physical_card.modal_section.request_new_card.city"
                                            value={requestPhysicalCardForm.values.city}
                                            onChange={(e) => {
                                                requestPhysicalCardForm.update({ city: e.target.value });
                                            }}
                                            autoComplete="address-level2"
                                            aria-label={translate(
                                                'modal_physical_card.modal_section.request_new_card.city',
                                            )}
                                        />
                                        <FormError error={requestPhysicalCardForm.errors?.city} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group">
                                        <FormError error={requestPhysicalCardForm?.errors?.to_many_requests} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-grow">
                            <button
                                className="button button-light button-sm flex-center"
                                type="button"
                                onClick={modal.close}>
                                {translate('modal_physical_card.buttons.request_new_card.cancel')}
                            </button>
                            <div className="flex flex-grow hide-sm">&nbsp;</div>
                            <button className="button button-primary button-sm flex-center" type="submit">
                                {translate('modal_physical_card.buttons.request_new_card.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {state == 'confirm_new_card' && (
                <div className="modal-window">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('modal_physical_card.buttons.close')}
                        role="button"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title" id="physicalCardTypeDialogTitle">
                            {translate('modal_physical_card.modal_section.confirm_card.header')}
                        </h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-primary">
                                <em className="mdi mdi-information-outline" />
                            </div>
                            <div className="modal-section-title">
                                {translate('modal_physical_card.modal_section.confirm_card.title')}
                            </div>
                            <div className="modal-section-space" />
                            <div className="modal-section-description">
                                {addressPreview().map((row, index) => (
                                    <div key={index}>{row}</div>
                                ))}
                            </div>
                            <div className="modal-section-space" />
                            <div className="modal-section-description">
                                {translate('modal_physical_card.modal_section.confirm_card.description')}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <div className="button-group flex-grow">
                            <button
                                className="button button-light button-sm flex-center"
                                type="button"
                                onClick={() => setState('select_type')}>
                                {translate('modal_physical_card.buttons.confirm_card.adjust')}
                            </button>
                            <div className="flex flex-grow hide-sm">&nbsp;</div>
                            <button
                                className="button button-primary button-sm flex-center"
                                type="button"
                                onClick={confirmCard}>
                                {translate('modal_physical_card.buttons.confirm_card.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {state == 'success_old_card' && (
                <div className="modal-window">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('modal_physical_card.buttons.close')}
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title" id="physicalCardTypeDialogTitle">
                            {translate('modal_physical_card.modal_section.link_card_success.title')}
                        </h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <em className="mdi mdi-check-circle-outline" />
                            </div>
                            <div className="modal-section-description">
                                {translate('modal_physical_card.modal_section.link_card_success.description', {
                                    fundName: voucher?.fund?.name,
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer flex-center">
                        <button
                            className="button button-light button-sm flex-center"
                            type="button"
                            onClick={modal.close}>
                            {translate('modal_physical_card.buttons.close')}
                        </button>
                    </div>
                </div>
            )}

            {state == 'success_new_card' && (
                <div className="modal-window">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={modal.close}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        aria-label={translate('modal_physical_card.buttons.close')}
                        role="button"
                    />

                    <div className="modal-header">
                        <h2 className="modal-header-title" id="physicalCardTypeDialogTitle">
                            {translate('modal_physical_card.modal_section.request_card_success.title')}
                        </h2>
                    </div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <em className="mdi mdi-check-circle-outline" />
                            </div>
                            <div className="modal-section-title" id="physicalCardTypeDialogSubtitle">
                                {translate('modal_physical_card.modal_section.request_card_success.title')}
                            </div>
                            <div className="modal-section-description">
                                {translate('modal_physical_card.modal_section.request_card_success.heading')}
                            </div>
                            <div className="modal-section-space" />
                            <div className="modal-section-space" />
                            <div className="modal-section-description">
                                {addressPreview().map((row, index) => (
                                    <div key={index}>{row}</div>
                                ))}
                            </div>
                            <div className="modal-section-space" />
                            <div className="modal-section-description">
                                {translate('modal_physical_card.modal_section.request_card_success.description')}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer flex-center">
                        <button
                            className="button button-light button-sm flex-center"
                            type="button"
                            onClick={modal.close}
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}>
                            {translate('modal_physical_card.buttons.close')}
                        </button>

                        {authIdentity?.email && <EmailProviderLink email={authIdentity.email} />}
                    </div>
                </div>
            )}
        </div>
    );
}
