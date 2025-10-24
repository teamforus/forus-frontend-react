import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import QrCode from '../../../../../../dashboard/components/elements/qr-code/QrCode';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import useEnvData from '../../../../../hooks/useEnvData';
import useLinkVoucherPhysicalCard from '../../hooks/useLinkVoucherPhysicalCard';
import useUnlinkVoucherPhysicalCard from '../../hooks/useUnlinkVoucherPhysicalCard';
import useShowPhysicalCardsOption from '../../hooks/useShowPhysicalCardsOption';
import ModalShareVoucher from '../../../../modals/ModalShareVoucher';
import ModalDeactivateVoucher from '../../../../modals/ModalDeactivateVoucher';
import ModalNotification from '../../../../modals/ModalNotification';
import useOpenModal from '../../../../../../dashboard/hooks/useOpenModal';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { useVoucherService } from '../../../../../services/VoucherService';
import { useNavigate } from 'react-router';
import VoucherNextShareOptions from './VoucherNextShareOptions';
import useVoucherCard from '../hooks/useVoucherCard';
import { makeQrCodeContent } from '../../../../../../dashboard/helpers/utils';

export default function VoucherNextActions({
    voucher,
    setVoucher,
    fetchVoucher,
}: {
    voucher: Voucher;
    setVoucher: Dispatch<SetStateAction<Voucher>>;
    fetchVoucher: () => void;
}) {
    const envData = useEnvData();

    const translate = useTranslate();
    const openModal = useOpenModal();
    const navigateState = useNavigate();

    const voucherService = useVoucherService();

    const linkVoucherPhysicalCard = useLinkVoucherPhysicalCard();
    const unlinkVoucherPhysicalCard = useUnlinkVoucherPhysicalCard();

    const voucherCard = useVoucherCard(voucher);
    const showPhysicalCardsOption = useShowPhysicalCardsOption(voucher);

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
            showPhysicalCardsOption &&
            !voucher?.physical_card &&
            fundPhysicalCardTypes?.length === 1 &&
            fundPhysicalCardTypes?.[0]?.allow_physical_card_linking
        );
    }, [voucher, fundPhysicalCardTypes, showPhysicalCardsOption]);

    const showPhysicalCardRequest = useMemo(() => {
        return (
            showPhysicalCardsOption &&
            !voucher?.physical_card &&
            fundPhysicalCardTypes?.length === 1 &&
            fundPhysicalCardTypes?.[0]?.allow_physical_card_requests
        );
    }, [voucher, fundPhysicalCardTypes, showPhysicalCardsOption]);

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
                            <VoucherNextShareOptions voucher={voucher} callerModal={modal} />
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
                    onConfirm={() => voucherService.destroy(voucher.number).then(() => navigateState('vouchers'))}
                />
            )),
        [navigateState, openModal, translate, voucherService],
    );

    return (
        <div className="voucher-actions">
            <div className="voucher-actions-qr">
                {voucher.address && (
                    <QrCode
                        padding={5}
                        className={'card-qr_code-element'}
                        value={makeQrCodeContent('voucher', voucher.address)}
                        aria-label={translate('voucher.qr_code.label', { number: voucher.number })}
                    />
                )}
            </div>
            <div className="voucher-actions-buttons">
                {voucherCard?.type === 'regular' && !voucherCard.external && (
                    <StateNavLink
                        className="voucher-actions-button"
                        name={'products'}
                        query={{ fund_id: voucher.fund_id }}>
                        <em className="mdi mdi-tag-heart-outline" />
                        {translate('voucher.actions.view_all_products')}
                    </StateNavLink>
                )}

                {!envData.config.flags.noPrintOption && (
                    <button
                        role={'button'}
                        onKeyDown={clickOnKeyEnter}
                        className="voucher-actions-button"
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
                        name={'reimbursements-create'}
                        params={{ voucher_id: voucher.id }}>
                        <em className="mdi mdi-cash-plus" />
                        {translate('voucher.actions.declaration_request')}
                    </StateNavLink>
                )}

                {voucherCard?.type === 'product' && !voucherCard.external && (
                    <button
                        type={'button'}
                        className="voucher-actions-button"
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
            </div>
        </div>
    );
}
