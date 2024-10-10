import File from './File';
import RecordType from './RecordType';
import FundRequestClarification from './FundRequestClarification';

export default interface FundRequestRecord {
    id: number;
    clarifications: Array<FundRequestClarification>;
    created_at: string;
    created_at_locale: string;
    files: Array<File>;
    fund_criterion_id: number;
    fund_request_id: number;
    history: Array<{
        id?: string;
        old_value?: string;
        new_value?: string;
        employee_email?: string;
        created_at?: string;
        created_at_locale?: string;
    }>;
    note: string;
    record_type: RecordType;
    record_type_key: string;
    value?: string;
    updated_at: string;
    updated_at_locale: string;
}
