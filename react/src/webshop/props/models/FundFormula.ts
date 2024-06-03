export default interface FundFormula {
    id: number;
    amount: string;
    amount_locale: string;
    record_type_key: string;
    type: 'fixed' | 'multiply';
    record_type_name?: string;
    updated_at_locale?: string;
}
