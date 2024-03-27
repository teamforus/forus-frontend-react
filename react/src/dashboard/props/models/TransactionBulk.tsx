import Bank from './Bank';

export default interface TransactionBulk {
    id: number;
    state: 'draft' | 'error' | 'pending' | 'accepted' | 'rejected';
    state_locale: string;
    payment_id?: string;
    accepted_manually: boolean;
    is_exported: boolean;
    auth_url?: string;
    bank?: Bank;
    execution_date?: string;
    execution_date_locale?: string;
    voucher_transactions_cost?: string;
    voucher_transactions_cost_locale?: string;
    voucher_transactions_count?: number;
    voucher_transactions_amount?: string;
    voucher_transactions_amount_locale?: string;
    created_at: string;
    created_at_locale: string;
}
