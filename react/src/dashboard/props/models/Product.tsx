import Office from './Office';
import Organization from './Organization';
import Media from './Media';
import ProductCategory from './ProductCategory';
import Fund from './Fund';
import Voucher from './Voucher';

export interface DealHistory {
    id: number;
    amount?: string;
    amount_locale?: string;
    limit_total?: number;
    limit_total_unlimited?: boolean;
    limit_per_identity?: number;
    voucher_transactions_count?: number;
    product_reservations_pending_count?: number;
    active: boolean;
    product_id: number;
    expire_at?: string;
    expire_at_locale?: string;
}

export default interface Product {
    id: number;
    name: string;
    description: string;
    description_html: string;
    product_category_id: number;
    sold_out: boolean;
    organization_id: number;
    reservation_enabled: boolean;
    reservation_policy: 'global';
    alternative_text?: string;
    photo?: Media;
    price: string;
    price_locale: string;
    organization: Organization;
    total_amount: number;
    unlimited_stock: boolean;
    reserved_amount: number;
    sold_amount: number;
    stock_amount?: number;
    expire_at: string;
    expire_at_locale: string;
    expired: boolean;
    deleted_at?: string;
    deleted_at_locale?: string;
    deleted: boolean;
    funds: Array<
        Fund & {
            organization: {
                id: number;
                name: string;
            };
            end_at: string;
            end_at_locale: string;
            reservations_enabled: boolean;
            reservation_extra_payments_enabled: boolean;
            fund_id?: number;
            limit_total?: number;
            limit_available?: number;
            limit_per_identity?: number;
            limit_total_unlimited: boolean;
            price?: string;
            price_locale?: string;
            vouchers?: Array<Voucher>;
        }
    >;
    offices: Array<Office>;
    product_category: ProductCategory;
    bookmarked: boolean;
    price_type: 'regular' | 'discount_fixed' | 'discount_percentage' | 'free';
    price_discount: string;
    price_discount_locale: string;
    price_min: string;
    price_min_locale: string;
    price_max: string;
    price_max_locale: string;
    lowest_price?: string;
    lowest_price_locale?: string;
    reservation_fields: boolean;
    reservation_phone: 'global' | 'no' | 'optional' | 'required';
    reservation_address: 'global' | 'no' | 'optional' | 'required';
    reservation_birth_date: 'global' | 'no' | 'optional' | 'required';
    reservation_extra_payments: 'global' | 'no' | 'yes';
    sponsor_organization_id?: number;
    sponsor_organization?: {
        id: number;
        name: string;
    };
    unseen_messages: number;
    excluded_funds: Array<{
        id: number;
        name: string;
        state: 'active' | 'closed' | 'paused' | 'waiting';
        expire_at: string;
    }>;
    deals_history?: Array<DealHistory>;
    is_available?: boolean;
    ean?: string;
    sku?: string;
}
