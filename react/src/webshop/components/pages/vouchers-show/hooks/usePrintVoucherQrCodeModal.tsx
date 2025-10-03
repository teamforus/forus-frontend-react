import React, { useCallback } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import VoucherQrCodePrintable from '../../../printable/VoucherQrCodePrintable';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useOpenPrintable from '../../../../../dashboard/hooks/useOpenPrintable';

export default function usePrintVoucherQrCodeModal() {
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();
    const openPrintable = useOpenPrintable();

    return useCallback(
        (voucher: Voucher) => {
            openPrintable((printable) => (
                <VoucherQrCodePrintable
                    printable={printable}
                    voucher={voucher}
                    webshopUrl={appConfigs?.fronts.url_webshop}
                    organization={!voucher.product ? voucher.fund.organization : voucher.product.organization}
                    assetUrl={assetUrl}
                />
            ));
        },
        [appConfigs?.fronts?.url_webshop, assetUrl, openPrintable],
    );
}
