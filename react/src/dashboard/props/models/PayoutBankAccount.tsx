export default interface PayoutBankAccount {
    id: number;
    iban: string;
    iban_name: string;
    created_at?: string;
    created_at_locale?: string;
}
