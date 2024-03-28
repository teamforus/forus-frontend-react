export default interface BankConnectionAccount {
    id?: number;
    type?: string;
    bank_connection_id?: number;
    monetary_account_id?: string;
    monetary_account_iban?: string;
}
