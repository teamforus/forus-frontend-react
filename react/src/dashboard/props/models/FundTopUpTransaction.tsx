export default interface FundTopUpTransaction {
    id: number;
    code: string;
    iban: string;
    amount: string;
    amount_locale: string;
    created_at: string;
    created_at_locale: string;
}
