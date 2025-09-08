import { useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';

export default function useShowPhysicalCardsOption(voucher: Voucher) {
    const physicalCardIsLinkable = useMemo(() => {
        return (
            voucher?.fund?.allow_physical_cards &&
            voucher?.fund?.allow_physical_card_linking &&
            voucher?.fund?.physical_card_types?.length > 0 &&
            voucher?.type === 'regular'
        );
    }, [voucher]);

    return useMemo(() => {
        return physicalCardIsLinkable && !voucher?.expired && !voucher?.deactivated;
    }, [physicalCardIsLinkable, voucher?.expired, voucher?.deactivated]);
}
