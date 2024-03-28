import Fund from './Fund';
import Employee from './Employee';
import File from './File';
import Transaction from './Transaction';

export default interface Reimbursement {
    id: number;
    code: string;
    title: string;
    description: string;
    identity_email: string;
    identity_bsn: string;
    fund: Fund;
    implementation_name: string;
    amount: string;
    amount_locale: string;
    created_at_locale: string;
    lead_time_locale: string;
    employee?: Employee;
    expired: boolean;
    state: string;
    state_locale: string;
    voucher_transaction: Transaction;
    deactivated: boolean;
    employee_id: number;
    resolved: boolean;
    expire_at: string;
    expire_at_locale: string;
    resolved_at: string;
    resolved_at_locale: string;
    iban: string;
    iban_name: string;
    files: Array<File>;
    provider_name: string;
    reimbursement_category?: { id: number; name: string };
    note?: string;
    reason?: string;
}
