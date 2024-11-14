import Office from '../Office';
import Organization from '../Organization';
import Media from '../Media';
import ProductCategory from '../ProductCategory';

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

export default interface SponsorProduct {
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
    deleted: boolean;
    funds: Array<{
        id: number;
        name: string;
        type: string;
        organization_id: number;
        organization_name: string;
        logo: Media;
    }>;
    offices: Array<Office>;
    product_category: ProductCategory;
    bookmarked: boolean;
    price_type: 'regular' | 'discount_fixed' | 'discount_percentage' | 'free';
    price_discount: string;
    price_discount_locale: string;
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
    monitored_history?: Array<{
        id: number;
        created_at: string;
        created_at_locale: string;
    }>;
    unseen_messages: number;
    deals_history?: Array<DealHistory>;
    is_available?: boolean;
    monitored_changes_count?: number;
    ean?: string;
    sku?: string;
    updated_at?: string;
    updated_at_locale?: string;
    deleted_at?: string;
    deleted_at_locale?: string;
    created_at?: string;
    created_at_locale?: string;
    last_monitored_changed_at?: string;
    last_monitored_changed_at_locale?: string;
}
