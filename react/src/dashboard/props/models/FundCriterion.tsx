import RecordType from './RecordType';
import FundCriterionRule from './FundCriterionRule';

export default interface FundCriterion {
    id?: number;
    record_type_key?: string;
    operator: '<' | '<=' | '>' | '>=' | '!=' | '=' | '*';
    show_attachment: boolean;
    label?: string;
    order?: number;
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
    fund_criteria_step_id?: number;
    rules?: Array<FundCriterionRule>;
}
