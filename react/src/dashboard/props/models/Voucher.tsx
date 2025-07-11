import Fund from './Fund';
import Office from './Office';
import Reservation from './Reservation';
import PhysicalCard from './PhysicalCard';
import Media from './Media';
import OrganizationBasic from './OrganizationBasic';
import Product from './Product';

export interface VoucherProduct {
    id?: number;
    name?: string;
    description?: string;
    description_html?: string;
    product_category_id?: number;
    sold_out?: boolean;
    reservation_enabled?: boolean;
    reservation_policy?: 'accept' | 'review' | 'global';
    alternative_text?: string;
    price?: string;
    price_locale?: string;
    organization_id?: number;
    photo?: Media;
    organization?: OrganizationBasic;
}

export interface VoucherTransaction {
    id: number;
    organization_id: number;
    product_id?: number;
    address: string;
    state: 'success' | 'pending' | 'canceled';
    state_locale: string;
    payment_id?: string;
    target?: 'provider' | 'iban' | 'top_up' | 'payout';
    amount: string;
    amount_locale: string;
    amount_extra_cash?: string;
    amount_extra_cash_locale?: string;
    timestamp: number;
    cancelable: boolean;
    transfer_in?: number;
    organization: {
        id: number;
        name: string;
        logo: Media;
    };
    product?: Product;
    fund: {
        id: number;
        name: string;
        organization_id: number;
        logo?: Media;
        organization_name: string;
    };
    created_at: string;
    created_at_locale: string;
    transfer_at?: string;
    transfer_at_locale?: string;
    updated_at: string;
    product_reservation?: Reservation;
}

export default interface Voucher {
    id: number;
    number?: string;
    address?: string;
    fund_id: number;
    expired?: boolean;
    fund: Fund;
    type?: 'regular' | 'product';
    state?: string;
    state_locale?: string;
    timestamp?: number;
    transactions: Array<VoucherTransaction>;
    product_vouchers?: Array<Voucher>;
    records?: Array<{
        voucher_id: number;
        value_locale: string;
        record_type_key: string;
        record_type_name: string;
    }>;
    product: VoucherProduct;
    product_reservation: Reservation;
    offices?: Array<Office>;
    query_product?: {
        reservable?: boolean;
        reservable_count?: number;
        reservable_enabled?: boolean;
        reservable_expire_at?: string;
        reservable_expire_at_locale?: string;
    };
    physical_card?: PhysicalCard;
    amount?: string;
    amount_locale?: string;
    external: boolean;
    history: Array<{
        id: number;
        event: string;
        event_locale: string;
        created_at: string;
        created_at_locale: string;
    }>;
    deactivated?: boolean;
    used: boolean;
    last_transaction_at?: string;
    last_transaction_at_locale?: string;
    records_title?: string;
    returnable?: boolean;
    last_active_day_locale?: string;
    created_at?: string;
    created_at_locale?: string;
    expire_at?: string;
    expire_at_locale?: string;
}
