import Employee from './Employee';
import RecordType from './RecordType';
import File from './File';

export default interface FundRequestRecord {
    id: number;
    clarifications: Array<{
        id?: number;
        answer?: string;
        question?: string;
        answered_at?: string;
        answered_at_locale?: string;
        files?: Array<File>;
    }>;
    created_at: string;
    created_at_locale: string;
    employee: Employee;
    employee_id: number;
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
    is_assignable: boolean;
    is_assigned: boolean;
    note: string;
    record_type: RecordType;
    record_type_key: string;
    state: string;
    value?: string;
    updated_at: string;
    updated_at_locale: string;
}
