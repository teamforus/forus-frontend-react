import File from './File';

export default interface FundRequestClarification {
    id?: number;
    answer?: string;
    question?: string;
    resolved_at?: string;
    resolved_at_locale?: string;
    state?: 'pending' | 'answered' | 'closed';
    files?: Array<File>;
    text_requirement?: 'no' | 'optional' | 'required';
    files_requirement?: 'no' | 'optional' | 'required';
    created_at?: string;
    created_at_locale?: string;
    updated_at?: string;
    updated_at_locale?: string;
    changed_at?: string;
    changed_at_locale?: string;
    fund_request_record_id?: number;
    fund_request_record_name?: string;
}
