import Media from './Media';
import Organization from './Organization';
import Fund from './Fund';
import Voucher from './Voucher';
import Office from './Office';
import ProductCategory from './ProductCategory';

export default interface FundProviderProduct {
    id: number;
    name: string;
    description: string;
    description_html: string;
    product_category_id: number;
    sold_out: boolean;
    organization_id: number;
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
    fund_id: number;
    fund_provider_id: number;
    fund: Fund;
    funds: Array<
        Fund & {
            organization: {
                id: number;
                name: string;
            };
            end_at: string;
            end_at_locale: string;
            fund_id?: number;
            limit_total?: number;
            limit_available?: number;
            limit_per_identity?: number;
            limit_total_unlimited: boolean;
            price?: string;
            price_locale?: string;
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
    price_min: string;
    price_min_locale: string;
    price_max: string;
    price_max_locale: string;
    lowest_price?: string;
    lowest_price_locale?: string;
    sponsor_organization_id?: number;
    sponsor_organization?: {
        id: number;
        name: string;
    };
    unseen_messages: number;
    is_available?: boolean;
    updated_at?: string;
    updated_at_locale?: string;
    created_at?: string;
    created_at_locale?: string;
    digest_logs_count?: number;
}
