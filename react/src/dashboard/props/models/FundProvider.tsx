import Fund from './Fund';
import Office from './Office';
import Employee from './Employee';
import Organization from './Organization';

export default interface FundProvider {
    id: number;
    organization_id: number;
    fund_id: number;
    state: 'pending' | 'accepted' | 'rejected' | 'unsubscribed';
    state_locale: string;
    dismissed: boolean;
    allow_products: boolean;
    allow_some_products: boolean;
    allow_budget: boolean;
    excluded: boolean;
    products: Array<number>;
    products_count_all: number;
    products_count_available: number;
    products_count_approved: number;
    fund: Fund;
    offices: Array<Office>;
    employees: Array<Employee>;
    organization: Organization;
    can_cancel: boolean;
    last_activity: string;
    last_activity_locale: string;
    allow_extra_payments?: boolean;
    allow_extra_payments_full?: boolean;
}
