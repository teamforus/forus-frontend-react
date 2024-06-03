import RecordType from './RecordType';

export default interface FundCriterion {
    id?: number;
    record_type_key?: string;
    operator: '<' | '<=' | '>' | '>=' | '!=' | '=' | '*';
    show_attachment: boolean;
    title?: string;
    description?: string;
    description_html?: string;
    record_type?: RecordType;
    min?: string;
    max?: string;
    optional: boolean;
    value?: string;
    has_record?: boolean;
    is_valid?: boolean;
}
