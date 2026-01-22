export default interface PayoutBankAccount {
    id?: number;
    iban: string;
    iban_name: string;
    type?: 'fund_request' | 'profile_bank_account' | 'reimbursement' | 'payout';
    type_id: number;
    created_at?: string;
    created_at_locale?: string;
    updated_at?: string;
    updated_at_locale?: string;
}
