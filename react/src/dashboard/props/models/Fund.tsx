import Organization from './Organization';
import Media from './Media';
import Implementation from './Implementation';
import FundCriterion from './FundCriterion';
import FundFormula from '../../../webshop/props/models/FundFormula';

interface FundVoucherStatistics {
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

export default interface Fund {
    id: number;
    name?: string;
    key?: string;
    logo?: Media;
    description?: string;
    description_short?: string;
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
    request_btn_text?: string;
    external_link_url?: string;
    external_link_text?: string;
    description_html?: string;
    description_position?: 'before' | 'after' | 'replace';
    implementation?: Implementation;
    csv_primary_key: string;
    csv_required_keys: Array<string>;
    criteria: Array<FundCriterion>;
    formulas?: Array<FundFormula>;
    budget?: FundVoucherStatistics & {
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
    product_vouchers: FundVoucherStatistics;
    faq: Array<{
        id: number;
        title: string;
        description: string;
        description_html: string;
    }>;
    faq_title?: string;
    allow_reimbursements?: boolean;
    allow_physical_cards?: boolean;
    allow_blocking_vouchers?: boolean;
}
