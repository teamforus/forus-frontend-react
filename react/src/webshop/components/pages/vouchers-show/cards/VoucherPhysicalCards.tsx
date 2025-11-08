import React, { useMemo } from 'react';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import useVoucherData from '../../../../services/helpers/useVoucherData';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useUnlinkVoucherPhysicalCard from '../hooks/useUnlinkVoucherPhysicalCard';
import useLinkVoucherPhysicalCard from '../hooks/useLinkVoucherPhysicalCard';
import useShowPhysicalCardsOption from '../hooks/useShowPhysicalCardsOption';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function VoucherPhysicalCards({
    voucher,
    setVoucher,
    fetchVoucher,
}: {
    voucher: Voucher;
    setVoucher: React.Dispatch<React.SetStateAction<Voucher>>;
    fetchVoucher: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const voucherCard = useVoucherData(voucher);
    const showPhysicalCardsOption = useShowPhysicalCardsOption(voucher);

    const linkVoucherPhysicalCard = useLinkVoucherPhysicalCard();
    const unlinkVoucherPhysicalCard = useUnlinkVoucherPhysicalCard();

    const fundPhysicalCardTypes = useMemo(() => {
        return voucher?.fund?.fund_physical_card_types;
    }, [voucher.fund.fund_physical_card_types]);

    const fundPhysicalCardType = useMemo(() => {
        return fundPhysicalCardTypes.find(
            (type) => type.physical_card_type_id === voucher?.physical_card?.physical_card_type_id,
        );
    }, [voucher, fundPhysicalCardTypes]);

    if (!showPhysicalCardsOption) {
        return null;
    }

    if (voucher.physical_card) {
        return (
            <div className="voucher-physical-cards">
                <div className="physical-card">
                    <div className="physical-card-content">
                        <div className="physical-card-media">
                            <img
                                src={
                                    voucher?.physical_card?.photo?.sizes?.thumbnail ||
                                    assetUrl('/assets/img/placeholders/physical-card-type.svg')
                                }
                                alt={translate('voucher.physical_card.alt', {
                                    title: voucherCard.title,
                                })}
                            />
                        </div>

                        <div className="physical-card-description">
                            <div className="physical-card-description-title">
                                {translate('voucher.physical_card.title')}
                            </div>
                            <div className="physical-card-description-code">{voucher?.physical_card.code}</div>
                        </div>
                    </div>

                    <div className="physical-card-actions">
                        {fundPhysicalCardType.allow_physical_card_deactivation && (
                            <button
                                onKeyDown={clickOnKeyEnter}
                                className="button button-primary-outline button-sm"
                                onClick={() => unlinkVoucherPhysicalCard(voucher, fetchVoucher, setVoucher)}>
                                {translate('voucher.physical_card.buttons.lost_pass')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="voucher-physical-cards">
            {voucher?.fund?.fund_physical_card_types?.map((typeCard) => (
                <div className="physical-card" key={typeCard.id}>
                    <div className="physical-card-content">
                        <div className="physical-card-media">
                            <img
                                src={
                                    typeCard?.physical_card_type?.photo?.sizes?.thumbnail ||
                                    assetUrl('/assets/img/placeholders/physical-card-type.svg')
                                }
                                alt={translate('voucher.physical_card.alt', { title: voucherCard.title })}
                            />
                        </div>
                        <div className="physical-card-description">
                            <div className="physical-card-description-code">
                                {translate('voucher.physical_card.title')}
                            </div>
                        </div>
                    </div>
                    <div className="physical-card-content-actions">
                        {typeCard.allow_physical_card_requests && (
                            <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={clickOnKeyEnter}
                                className="button button-primary-outline button-sm"
                                onClick={() => {
                                    linkVoucherPhysicalCard(voucher, typeCard, 'select_type', fetchVoucher);
                                }}>
                                {translate('modal_physical_card.modal_section.type_selection.card_new.title')}
                            </div>
                        )}

                        {typeCard.allow_physical_card_linking && (
                            <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={clickOnKeyEnter}
                                className="button button-primary button-sm"
                                onClick={() => {
                                    linkVoucherPhysicalCard(voucher, typeCard, 'card_code', fetchVoucher);
                                }}>
                                {translate('voucher.physical_card.buttons.reactivate')}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
