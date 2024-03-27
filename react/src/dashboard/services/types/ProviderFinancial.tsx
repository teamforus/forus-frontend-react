import Organization from '../../props/models/Organization';

export default interface ProviderFinancial {
    provider: Organization;
    total_spent?: string;
    total_spent_locale?: string;
    highest_transaction?: string;
    highest_transaction_locale?: string;
    nr_transactions?: number;
}
