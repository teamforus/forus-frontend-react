import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import React, { useCallback, useMemo } from 'react';
import useSendVoucherEmail from '../hooks/useSendVoucherEmail';
import useOpenVoucherInMeModal from '../hooks/useOpenVoucherInMeModal';
import usePrintVoucherQrCodeModal from '../hooks/usePrintVoucherQrCodeModal';
import useLinkVoucherPhysicalCard from '../hooks/useLinkVoucherPhysicalCard';
import useUnlinkVoucherPhysicalCard from '../hooks/useUnlinkVoucherPhysicalCard';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import ModalShareVoucher from '../../../modals/ModalShareVoucher';
import ModalDeactivateVoucher from '../../../modals/ModalDeactivateVoucher';
import useEnvData from '../../../../hooks/useEnvData';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import ModalNotification from '../../../modals/ModalNotification';
import { useVoucherService } from '../../../../services/VoucherService';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useShowPhysicalCardsOption from '../hooks/useShowPhysicalCardsOption';

export default function VoucherActions({
    voucher,
    setVoucher,
    fetchVoucher,
}: {
    voucher: Voucher;
    setVoucher: React.Dispatch<React.SetStateAction<Voucher>>;
    fetchVoucher: () => void;
}) {
    const envData = useEnvData();
    const voucherCard = useVoucherData(voucher);

    const translate = useTranslate();
    const openModal = useOpenModal();
    const navigateState = useNavigateState();

    const voucherService = useVoucherService();

    const sendVoucherEmail = useSendVoucherEmail();
    const openVoucherInMeModal = useOpenVoucherInMeModal();
    const printVoucherQrCodeModal = usePrintVoucherQrCodeModal();
    const linkVoucherPhysicalCard = useLinkVoucherPhysicalCard();
    const unlinkVoucherPhysicalCard = useUnlinkVoucherPhysicalCard();

    const showPhysicalCardsOption = useShowPhysicalCardsOption(voucher);

    const fundPhysicalCardTypes = useMemo(() => {
        return voucher?.fund?.fund_physical_card_types;
    }, [voucher.fund.fund_physical_card_types]);

    const fundPhysicalCardType = useMemo(() => {
        return fundPhysicalCardTypes.find(
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

    const shareVoucher = useCallback(
        (voucher: Voucher) => {
            openModal((modal) => <ModalShareVoucher modal={modal} voucher={voucher} />);
        },
        [openModal],
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
        function (voucher: Voucher) {
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
            ));
        },
        [navigateState, openModal, translate, voucherService],
    );

    return (
        <div className="card-actions">
            <div className="action-col">
                <div
                    role={'button'}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    className="action-item"
                    onClick={() => sendVoucherEmail(voucher)}>
                    <div className="action-item-icon">
                        <em className="mdi mdi-email-outline" />
                    </div>
                    <div className="action-item-name">
                        {translate('modal_physical_card.modal_section.request_new_card.email_to_me')}
                    </div>
                </div>
            </div>
            <div className="action-col">
                <div
                    role={'button'}
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    className="action-item"
                    onClick={openVoucherInMeModal}>
                    <div className="action-item-icon">
                        <em className="mdi mdi-account-circle" />
                    </div>
                    <div className="action-item-name">
                        {translate('modal_physical_card.modal_section.request_new_card.open_in_app')}
                    </div>
                </div>
            </div>

            {!envData.config.flags.noPrintOption && (
                <div className="action-col">
                    <div
                        role={'button'}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="action-item"
                        onClick={() => printVoucherQrCodeModal(voucher)}>
                        <div className="action-item-icon">
                            <em className="mdi mdi-printer" />
                        </div>
                        <div className="action-item-name">
                            {translate('modal_physical_card.modal_section.request_new_card.print_pass')}
                        </div>
                    </div>
                </div>
            )}

            {showPhysicalCardRequest && (
                <div className="action-col">
                    <div
                        role={'button'}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="action-item"
                        onClick={() =>
                            linkVoucherPhysicalCard(
                                voucher,
                                voucher?.fund?.fund_physical_card_types?.[0],
                                'select_type',
                                fetchVoucher,
                            )
                        }>
                        <div className="action-item-icon">
                            <em className="mdi mdi-card-bulleted-outline" />
                        </div>
                        <div className="action-item-name">
                            {translate('modal_physical_card.modal_section.type_selection.card_new.title')}
                        </div>
                    </div>
                </div>
            )}

            {showPhysicalCardLink && (
                <div className="action-col">
                    <div
                        role={'button'}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="action-item"
                        onClick={() =>
                            linkVoucherPhysicalCard(
                                voucher,
                                voucher?.fund?.fund_physical_card_types?.[0],
                                'card_code',
                                fetchVoucher,
                            )
                        }>
                        <div className="action-item-icon">
                            <em className="mdi mdi-card-bulleted-outline" />
                        </div>
                        <div className="action-item-name">{translate('voucher.card.activate_my_pass')}</div>
                    </div>
                </div>
            )}

            {showPhysicalCardUnlink && (
                <div className="action-col">
                    <div
                        role={'button'}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="action-item"
                        onClick={() => {
                            unlinkVoucherPhysicalCard(voucher, fetchVoucher, setVoucher);
                        }}>
                        <div className="action-item-icon">
                            <em className="mdi mdi-card-bulleted-outline" />
                        </div>
                        <div className="action-item-name">{translate('voucher.card.lost_my_pass')}</div>
                    </div>
                </div>
            )}

            {voucherCard.product && (
                <div className="action-col">
                    <div
                        role={'button'}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="action-item"
                        onClick={() => shareVoucher(voucher)}>
                        <div className="action-item-icon">
                            <em className="mdi mdi-share-variant" />
                        </div>
                        <div className="action-item-name">{translate('voucher.card.share')}</div>
                    </div>
                </div>
            )}

            {!voucherCard.used && voucherCard.product && voucherCard.returnable && (
                <div className="action-col">
                    <div
                        role={'button'}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="action-item"
                        onClick={() => deleteVoucher(voucher)}>
                        <div className="action-item-icon">
                            <em className="mdi mdi-cancel" />
                        </div>
                        <div className="action-item-name">{translate('voucher.card.cancel')}</div>
                    </div>
                </div>
            )}

            {!voucher.expired && voucher.fund.allow_blocking_vouchers && (
                <div className="action-col">
                    <div
                        role={'button'}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="action-item"
                        onClick={() => deactivateVoucher(voucher)}>
                        <div className="action-item-icon">
                            <em className="mdi mdi-logout" />
                        </div>
                        <div className="action-item-name">{translate('voucher.card.stop_participation')}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
