import React, { Fragment, useMemo } from 'react';
import { OptionType } from '../../../../../../dashboard/components/elements/select-control/SelectControl';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function SelectControlOptionItemVoucher<T>({
    option,
    selectOption,
}: {
    option: OptionType<T>;
    selectOption: (options: OptionType<T>) => void;
}) {
    const voucher = useMemo(() => option?.raw as Voucher, [option]);
    const assetUrl = useAssetUrl();

    return (
        <div
            key={option.id}
            className="voucher-item voucher-item-select voucher-item-select"
            data-dusk={`voucherSelectorOption${voucher?.id}`}
            onKeyDown={(e) => (e.key === 'Enter' ? e.currentTarget.click() : null)}
            tabIndex={0}
            onClick={(e) => {
                e.stopPropagation();
                selectOption(option);
            }}
            role="option">
            <div className="voucher-image">
                <img
                    alt={''}
                    src={
                        voucher?.fund?.logo?.sizes.thumbnail ||
                        voucher?.fund?.organization?.logo?.sizes?.thumbnail ||
                        assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                    }
                />
            </div>
            <div className="voucher-details">
                <div className="flex flex-horizontal">
                    <div className="flex flex-vertical flex-grow">
                        <div className="voucher-name">
                            {voucher?.fund.name} #{voucher?.number}
                        </div>
                        <div className="voucher-organization">
                            {voucher.records_title && (
                                <Fragment>
                                    <span>{voucher?.records_title}</span>
                                    <span className="text-separator" />
                                </Fragment>
                            )}
                            <span>{voucher?.fund?.organization.name}</span>
                        </div>
                    </div>
                    <div className="flex flex-vertical text-right">
                        <div className="voucher-value">{voucher?.amount_locale}</div>
                        <div className="voucher-date">{voucher?.expire_at_locale}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
