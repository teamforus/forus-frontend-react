import SponsorVoucher from './SponsorVoucher';
import PhysicalCardType from '../PhysicalCardType';

export default interface SponsorPhysicalCard {
    id: number;
    code: string;
    code_locale: string;
    voucher: SponsorVoucher;
    physical_card_type: PhysicalCardType;
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
}
