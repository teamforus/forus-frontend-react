import { useMemo } from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';

export default function useShowPhysicalCardsOption(voucher: Voucher) {
    return useMemo(() => {
        return (
            voucher?.type === 'regular' &&
            voucher?.fund?.allow_physical_cards &&
            !voucher?.deactivated &&
            !voucher?.expired
        );
    }, [voucher]);
}
