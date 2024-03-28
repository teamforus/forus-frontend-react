export default interface FundCriterion {
    id: number;
    operator: '>' | '>=' | '<' | '<=' | '=';
    value?: string;
    show_attachment: boolean;
    title?: string;
    description?: string;
    description_html?: string;
    external_validators: Array<{
        accepted: boolean;
        organization_id: number;
        organization_validator_id: number;
    }>;
    record_type?: {
        key: string;
        name: string;
        options: Array<{ value: string; name: string }>;
    };
    record_type_key?: string;
    is_valid?: boolean;
}
