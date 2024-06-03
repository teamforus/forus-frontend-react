export default interface FundFormula {
    amount: string;
    amount_locale: string;
    record_type_key: string;
    type: 'fixed' | 'multiply';
}
