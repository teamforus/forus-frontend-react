export interface FundTotals {
    budget: number;
    budget_left: number;
    budget_used: number;
    budget_locale: string;
    budget_left_locale: string;
    budget_used_locale: string;
    budget_used_active_vouchers: number;
    budget_used_active_vouchers_locale: string;
    transaction_costs: number;
    transaction_costs_locale: string;
    vouchers_count: number;
    vouchers_amount: string;
    vouchers_amount_locale: string;
    active_vouchers_amount: string;
    active_vouchers_amount_locale: string;
    active_vouchers_count: number;
    inactive_vouchers_amount: string;
    inactive_vouchers_amount_locale: string;
    inactive_vouchers_count: number;
    deactivated_vouchers_amount: string;
    deactivated_vouchers_amount_locale: string;
    deactivated_vouchers_count: number;
}

export default interface FinancialOverview {
    funds: FundTotals;
    budget_funds: FundTotals;
}
