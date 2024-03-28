import BankConnectionAccount from './BankConnectionAccount';
import Bank from './Bank';

export default interface BankConnection {
    id: number;
    bank_id: number;
    iban?: string;
    bank: Bank;
    accounts?: [BankConnectionAccount];
    account_default?: BankConnectionAccount;
    organization_id: number;
    implementation_id: number;
    bank_connection_account_id: number;
    consent_id?: string;
    auth_url?: string;
    auth_params?: string;
    redirect_token?: string;
    access_token?: string;
    code?: string;
    context?: string;
    state: string;
    state_locale: string;
    created_at: string;
    created_at_locale: string;
    expire_at: string;
    expire_at_locale: string;
}
