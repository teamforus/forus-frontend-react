import Organization from './Organization';
import Media from './Media';
import Implementation from './Implementation';

export default interface Fund {
    id: number;
    key?: string;
    name?: string;
    logo?: Media;
    organization_id: number;
    organization?: Organization;
    products_count_all?: number;
    products_count_approved?: number;
    products_count_available?: number;
    state?: 'pending' | 'active' | 'closed' | 'paused';
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
    backoffice?: {
        backoffice_enabled?: boolean;
        backoffice_url?: string;
        backoffice_key?: string;
        backoffice_certificate?: string;
        backoffice_fallback?: boolean;
        backoffice_ineligible_policy?: string;
        backoffice_ineligible_redirect_url?: string;
    };
}
