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
            <div className="block block-action-card">
                <div className="block-card-logo">
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
                <div className="block-card-details">
                    <div className="block-card-code">
                        {translate('voucher.physical_card.card_number')}: {voucher.physical_card.code_locale}
                    </div>
                </div>
                {fundPhysicalCardType.allow_physical_card_deactivation && (
                    <div className="block-card-actions">
                        <div
                            className="button button-primary-outline"
                            onClick={() => unlinkVoucherPhysicalCard(voucher, fetchVoucher, setVoucher)}>
                            {translate('voucher.physical_card.buttons.lost_pass')}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return voucher?.fund?.fund_physical_card_types?.map((typeCard) => (
        <div className="block block-action-card" key={typeCard.id}>
            <div className="block-card-logo">
                <img
                    src={
                        typeCard?.physical_card_type?.photo?.sizes?.thumbnail ||
                        assetUrl('/assets/img/placeholders/physical-card-type.svg')
                    }
                    alt={`Fysieke pas: '${voucherCard.title}'`}
                />
            </div>
            <div className="block-card-details">
                <h3 className="block-card-title">{translate('voucher.physical_card.title')}</h3>
            </div>
            {typeCard.allow_physical_card_linking && (
                <div className="block-card-actions">
                    <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        className="button button-primary"
                        onClick={() => {
                            linkVoucherPhysicalCard(voucher, typeCard, 'card_code', fetchVoucher);
                        }}>
                        {translate('voucher.physical_card.buttons.reactivate')}
                    </div>
                </div>
            )}
        </div>
    ));
}
