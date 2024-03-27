import Organization from './Organization';
import Media from './Media';
import Implementation from './Implementation';

export default interface Fund {
    id: number;
    name?: string;
    logo?: Media;
    organization_id: number;
    organization?: Organization;
    products_count_all?: number;
    products_count_approved?: number;
    products_count_available?: number;
    state?: 'pending' | 'active' | 'closed' | 'waiting';
    state_locale?: string;
    start_date?: string;
    start_date_locale?: string;
    end_date?: string;
    end_date_locale?: string;
    fund_amount?: string;
    fund_amount_locale?: string;
    type?: 'budget' | 'subsidies' | 'external';
    allow_direct_payments?: boolean;
    archived?: boolean;
    expired?: boolean;
    implementation?: Implementation;
    budget?: VoucherData & {
        used_active_vouchers?: string;
        used_active_vouchers_locale?: string;
        total?: string;
        total_locale?: string;
        used?: string;
        used_locale?: string;
        left?: string;
        left_locale?: string;
        transaction_costs?: string;
        transaction_costs_locale?: string;
    };
    product_vouchers: VoucherData;
    formulas: Array<{
        type?: string;
        amount?: string;
        amount_locale?: string;
        record_type_key?: string;
    }>;
}

export interface VoucherData {
    active_vouchers_amount?: string;
    active_vouchers_amount_locale?: string;
    vouchers_amount?: string;
    vouchers_amount_locale?: string;
    inactive_vouchers_amount?: string;
    inactive_vouchers_amount_locale?: string;
    deactivated_vouchers_amount?: string;
    deactivated_vouchers_amount_locale?: string;
    vouchers_count?: number;
    active_vouchers_count?: number;
    inactive_vouchers_count?: number;
    deactivated_vouchers_count?: number;
    children_count?: number;
}
