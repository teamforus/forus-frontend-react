import Fund from './Fund';
import FundRequestRecord from './FundRequestRecord';
import Employee from './Employee';
import FundRequestApiPerson from './FundRequestApiPerson';
import FundCriterion from './FundCriterion';

export default interface FundRequest {
    id: number;
    bsn?: string | null;
    email?: string | null;
    fund: Fund & {
        has_person_bsn_api?: boolean;
        criteria: Array<FundCriterion>;
    };
    fund_id: number;
    lead_time_days: number;
    lead_time_locale: string;
    allowed_employees: Array<Employee>;
    contact_information: string | null;
    note: string;
    records: Array<FundRequestRecord>;
    replaced: boolean;
    state: 'pending' | 'approved' | 'declined' | 'disregarded' | 'approved_partly';
    state_locale: string;
    updated_at?: string | null;
    updated_at_locale?: string | null;
    created_at?: string | null;
    created_at_locale?: string | null;
    resolved_at?: string | null;
    resolved_at_locale?: string | null;
    person?: FundRequestApiPerson;
    person_relative?: FundRequestApiPerson;
    person_breadcrumbs?: Array<FundRequestApiPerson>;
}
