import RecordType from './RecordType';

export default interface FundCriterion {
    id: number;
    description?: string;
    description_html?: string;
    external_validators: Array<{
        accepted: boolean;
        organization_id: number;
        organization_validator_id: number;
    }>;
    has_record: boolean;
    is_valid?: boolean;
    max?: number;
    min?: number;
    operator: '<' | '<=' | '>' | '>=' | '!=' | '=' | '*';
    optional: boolean;
    record_type?: RecordType;
    value?: string;
    show_attachment: boolean;
    title?: string;
    record_type_key?: string;
}
