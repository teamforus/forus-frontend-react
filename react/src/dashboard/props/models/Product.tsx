import Office from './Office';
import Organization from './Organization';
import Media from './Media';
import ProductCategory from './ProductCategory';
import Fund from './Fund';
import Voucher from './Voucher';

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
            feature_scanning_enabled: boolean;
            feature_reservations_enabled: boolean;
            feature_reservation_extra_payments_enabled: boolean;
            fund_id?: number;
            limit_total?: number;
            limit_available?: number;
            limit_per_identity?: number;
            limit_total_unlimited?: boolean;
            price?: string;
            price_locale?: string;
            amount?: string;
            amount_locale?: string;
            payment_type?: 'subsidy' | 'budget';
            payment_type_locale?: string;
            user_price?: string;
            user_price_locale?: string;
            vouchers?: Array<Voucher>;
            fund_providers?: Array<Organization>;
        }
    >;
    offices: Array<Office>;
    product_category: ProductCategory;
    bookmarked: boolean;
    price_type: 'regular' | 'discount_fixed' | 'discount_percentage' | 'free';
    price_discount: string;
    price_discount_locale: string;
    price_min?: string;
    price_min_locale?: string;
    price_max?: string;
    price_max_locale?: string;
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
    is_available?: boolean;
    ean?: string;
    sku?: string;
    updated_at?: string;
    updated_at_locale?: string;
    created_at?: string;
    created_at_locale?: string;
}
