import Media from './Media';
import Voucher from './Voucher';

export default interface PhysicalCard {
    id: number;
    code: string;
    code_locale: string;
    physical_card_type_id?: number;
    photo?: Media;
    voucher?: Voucher;
}
