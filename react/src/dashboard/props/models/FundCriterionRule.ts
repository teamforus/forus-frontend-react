export default interface FundCriterionRule {
    record_type_key: string;
    operator: '<' | '<=' | '>' | '>=' | '!=' | '=';
    value: string;
}
