import RecordType from '../../../dashboard/props/models/RecordType';
import FundCriterionRule from './FundCriterionRule';

export default interface FundCriterion {
    description: string;
    description_html: string;
    external_validators: boolean;
    has_record: boolean;
    id: number;
    is_valid: boolean;
    max?: number;
    min?: number;
    operator: '<' | '<=' | '>' | '>=' | '!=' | '=' | '*';
    optional: boolean;
    record_type: RecordType;
    record_type_key: string;
    order?: number;
    show_attachment: boolean;
    fund_criteria_step_id?: number;
    rules: Array<FundCriterionRule>;
    title: string;
    value: string;
}
