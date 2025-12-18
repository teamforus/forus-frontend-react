import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import QrCode from '../../../../../dashboard/components/elements/qr-code/QrCode';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useLinkVoucherPhysicalCard from '../hooks/useLinkVoucherPhysicalCard';
import useUnlinkVoucherPhysicalCard from '../hooks/useUnlinkVoucherPhysicalCard';
import useShowPhysicalCardsOption from '../hooks/useShowPhysicalCardsOption';
import ModalShareVoucher from '../../../modals/ModalShareVoucher';
import ModalDeactivateVoucher from '../../../modals/ModalDeactivateVoucher';
import ModalNotification from '../../../modals/ModalNotification';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { useVoucherService } from '../../../../services/VoucherService';
import { useNavigate } from 'react-router';
import VoucherShareOptions from './VoucherShareOptions';
import useVoucherCard from '../hooks/useVoucherCard';
import { makeQrCodeContent } from '../../../../../dashboard/helpers/utils';
import IconReimbursement from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-reimbursement.svg';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import ModalVoucherPayout from '../../../modals/ModalVoucherPayout';
import usePayoutEligibleVouchers from '../hooks/usePayoutEligibleVouchers';

export default function VoucherActions({
    voucher,
    setVoucher,
    fetchVoucher,
}: {
    voucher: Voucher;
    setVoucher: Dispatch<SetStateAction<Voucher>>;
    fetchVoucher: () => void;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const navigateState = useNavigate();

    const voucherService = useVoucherService();

    const linkVoucherPhysicalCard = useLinkVoucherPhysicalCard();
    const unlinkVoucherPhysicalCard = useUnlinkVoucherPhysicalCard();

    const voucherCard = useVoucherCard(voucher);
    const showPhysicalCardsOption = useShowPhysicalCardsOption(voucher);
    const payoutEligibleVouchers = usePayoutEligibleVouchers([voucher].filter(Boolean));

    const fundPhysicalCardTypes = useMemo(() => {
        return voucher?.fund?.fund_physical_card_types;
    }, [voucher?.fund?.fund_physical_card_types]);

    const fundPhysicalCardType = useMemo(() => {
        return fundPhysicalCardTypes?.find(
            (type) => type.physical_card_type_id === voucher?.physical_card?.physical_card_type_id,
        );
    }, [voucher, fundPhysicalCardTypes]);

    const showPhysicalCardLink = useMemo(() => {
        return (
            !voucherCard.external &&
            !voucher?.physical_card &&
            showPhysicalCardsOption &&
            fundPhysicalCardTypes?.length === 1 &&
            fundPhysicalCardTypes?.[0]?.allow_physical_card_linking
        );
    }, [voucherCard.external, voucher?.physical_card, showPhysicalCardsOption, fundPhysicalCardTypes]);

    const showPhysicalCardRequest = useMemo(() => {
        return (
            !voucherCard.external &&
            !voucher?.physical_card &&
            showPhysicalCardsOption &&
            fundPhysicalCardTypes?.length === 1 &&
            fundPhysicalCardTypes?.[0]?.allow_physical_card_requests
        );
    }, [voucherCard.external, voucher?.physical_card, showPhysicalCardsOption, fundPhysicalCardTypes]);

    const showPhysicalCardUnlink = useMemo(() => {
        return (
            showPhysicalCardsOption && voucher.physical_card && fundPhysicalCardType?.allow_physical_card_deactivation
        );
    }, [voucher, fundPhysicalCardType, showPhysicalCardsOption]);

    const shareVoucherWithProvider = useCallback(
        (voucher: Voucher) => {
            openModal((modal) => <ModalShareVoucher modal={modal} voucher={voucher} />);
        },
        [openModal],
    );

    const openSaveVoucher = useCallback(
        (voucher: Voucher) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'info'}
                    title={translate('voucher.share_voucher.popup_sent.title_modal')}
                    appendElement={
                        <div className="flex flex-vertical flex-gap-xl">
                            <div className="flex flex-vertical">
                                <div className="modal-section-title">
                                    {translate('voucher.actions.choose_action.title')}
                                </div>
                                <div className="modal-section-description">
                                    {translate('voucher.actions.choose_action.description')}
                                </div>
                            </div>
                            <VoucherShareOptions voucher={voucher} callerModal={modal} />
                        </div>
                    }
                />
            ));
        },
        [openModal, translate],
    );

    const deactivateVoucher = useCallback(
        (voucher: Voucher) => {
            openModal((modal) => (
                <ModalDeactivateVoucher
                    modal={modal}
                    voucher={voucher}
                    onDeactivated={(voucher) => setVoucher(voucher)}
                />
            ));
        },
        [openModal, setVoucher],
    );

    const deleteVoucher = useCallback(
        (voucher: Voucher) =>
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={translate('voucher.delete_voucher.title')}
                    description={translate('voucher.delete_voucher.popup_form.description')}
                    mdiIconType={'warning'}
                    mdiIconClass={'alert-outline'}
                    cancelBtnText={translate('voucher.delete_voucher.buttons.close')}
                    confirmBtnText={translate('voucher.delete_voucher.buttons.submit')}
                    onConfirm={() =>
                        voucherService.destroy(voucher.number).then(() => navigateState(WebshopRoutes.VOUCHERS))
                    }
                />
            )),
        [navigateState, openModal, translate, voucherService],
    );

    const canRequestPayout = payoutEligibleVouchers.length > 0;

    const openPayoutModal = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherPayout
                modal={modal}
                selectedVoucher={voucher}
                onCreated={fetchVoucher}
                vouchers={payoutEligibleVouchers}
            />
        ));
    }, [fetchVoucher, openModal, payoutEligibleVouchers, voucher]);

    return (
        <div className="voucher-actions">
            <div className="voucher-actions-qr">
                {voucher.address &&
                    (voucher?.external || !voucherCard.fund.show_qr_code ? (
                        <div className="voucher-actions-qr-svg">
                            <IconReimbursement />
                        </div>
                    ) : (
                        <QrCode
                            padding={5}
                            className={'card-qr_code-element'}
                            value={makeQrCodeContent('voucher', voucher.address)}
                            aria-label={translate('voucher.qr_code.label', { number: voucher.number })}
                            dusk="voucherQrCode"
                        />
                    ))}
            </div>
            <div className="voucher-actions-buttons">
                {voucherCard?.type === 'regular' && !voucherCard.external && (
                    <StateNavLink
                        className="voucher-actions-button"
                        name={WebshopRoutes.PRODUCTS}
                        query={{ fund_id: voucher.fund_id }}>
                        <em className="mdi mdi-tag-heart-outline" />
                        {translate('voucher.actions.view_all_products')}
                    </StateNavLink>
                )}

                {!voucher?.external && voucher?.fund?.show_qr_code && (
                    <button
                        role={'button'}
                        onKeyDown={clickOnKeyEnter}
                        className="voucher-actions-button"
                        data-dusk="openVoucherShareModal"
                        onClick={() => openSaveVoucher(voucher)}>
                        <em className="mdi mdi-qrcode" />
                        {translate('voucher.actions.save_qr')}
                    </button>
                )}

                {showPhysicalCardRequest && (
                    <button
                        type={'button'}
                        className="voucher-actions-button"
                        onKeyDown={clickOnKeyEnter}
                        onClick={() =>
                            linkVoucherPhysicalCard(
                                voucher,
                                voucher?.fund?.fund_physical_card_types?.[0],
                                'select_type',
                                fetchVoucher,
                            )
                        }>
                        <em className="mdi mdi-card-bulleted-outline" />
                        {translate('modal_physical_card.modal_section.type_selection.card_new.title')}
                    </button>
                )}

                {showPhysicalCardLink && (
                    <button
                        type={'button'}
                        className="voucher-actions-button"
                        onKeyDown={clickOnKeyEnter}
                        onClick={() =>
                            linkVoucherPhysicalCard(
                                voucher,
                                voucher?.fund?.fund_physical_card_types?.[0],
                                'card_code',
                                fetchVoucher,
                            )
                        }>
                        <em className="mdi mdi-card-bulleted-outline" />
                        {translate('voucher.card.activate_my_pass')}
                    </button>
                )}

                {showPhysicalCardUnlink && (
                    <button
                        type={'button'}
                        className="voucher-actions-button"
                        onKeyDown={clickOnKeyEnter}
                        onClick={() => unlinkVoucherPhysicalCard(voucher, fetchVoucher, setVoucher)}>
                        <em className="mdi mdi-card-bulleted-outline" />
                        {translate('voucher.card.lost_my_pass')}
                    </button>
                )}

                {voucher.fund.allow_reimbursements && !voucher.expired && !voucher.deactivated && (
                    <StateNavLink
                        className="voucher-actions-button"
                        name={WebshopRoutes.REIMBURSEMENT_CREATE}
                        params={{ voucher_id: voucher.id }}>
                        <em className="mdi mdi-cash-plus" />
                        {translate('voucher.actions.declaration_request')}
                    </StateNavLink>
                )}

                {voucherCard?.type === 'product' && !voucherCard?.external && voucher?.fund?.show_qr_code && (
                    <button
                        type={'button'}
                        className="voucher-actions-button"
                        data-dusk="shareVoucher"
                        onKeyDown={clickOnKeyEnter}
                        onClick={() => shareVoucherWithProvider(voucher)}>
                        <em className="mdi mdi-share-variant-outline" />
                        {translate('voucher.actions.share_with_provider')}
                    </button>
                )}

                {!voucherCard.used && voucherCard.product && voucherCard.returnable && (
                    <button
                        type={'button'}
                        className="voucher-actions-button"
                        onKeyDown={clickOnKeyEnter}
                        onClick={() => deleteVoucher(voucher)}>
                        <em className="mdi mdi-cancel" />
                        {translate('voucher.card.cancel')}
                    </button>
                )}

                {!voucher.expired && voucher.fund.allow_blocking_vouchers && (
                    <button
                        type={'button'}
                        className="voucher-actions-button"
                        onKeyDown={clickOnKeyEnter}
                        onClick={() => deactivateVoucher(voucher)}>
                        <em className="mdi mdi-logout" />
                        {translate('voucher.card.stop_participation')}
                    </button>
                )}

                {canRequestPayout && (
                    <button
                        type="button"
                        className="voucher-actions-button"
                        data-dusk="openVoucherPayoutModal"
                        onKeyDown={clickOnKeyEnter}
                        onClick={openPayoutModal}>
                        <em className="mdi mdi-bank-transfer-in" />
                        {translate('voucher.actions.transfer_to_bank')}
                    </button>
                )}
            </div>
        </div>
    );
}
