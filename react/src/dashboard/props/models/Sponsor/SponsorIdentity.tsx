import RecordType from '../RecordType';

export type SponsorIdentityCounts = {
    active: number;
    selected: number;
    without_email: number;
};

export type ProfileBankAccount = {
    id: number;
    name: string;
    iban: string;
    created_by: string;
    created_by_locale: string;
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
};

export type ProfileRecord = {
    id: number;
    value: string;
    value_locale?: string;
    key: string;
    name: string;
    timestamp: number;
    employee?: {
        id: number;
        email: string;
    };
    sponsor?: boolean;
    sponsor_name?: string;
    created_at: string;
    created_at_locale: string;
};

export type ProfileRecordType =
    | 'given_name'
    | 'family_name'
    | 'telephone'
    | 'mobile'
    | 'birth_date'
    | 'city'
    | 'street'
    | 'house_number'
    | 'house_number_addition'
    | 'postal_code'
    | 'house_composition'
    | 'municipality_name'
    | 'neighborhood_name'
    | 'client_number'
    | 'gender'
    | 'living_arrangement'
    | 'marital_status'
    | 'net_worth'
    | 'adults_nth'
    | 'primary_email'
    // address field (not record type)
    | 'house_nr'
    | 'house_nr_addition';

export type ProfileRecords = { [key in ProfileRecordType]: RecordType };
export type ProfileRecordValues = { [key in ProfileRecordType]: string };

export default interface SponsorIdentity {
    id: number;
    bsn?: string;
    type?: 'profile' | 'voucher' | 'employee';
    type_locale?: string;
    email?: string;
    email_verified?: Array<string>;
    employee_id?: number;
    employee_email?: string;
    address?: string;
    records?: { [key in ProfileRecordType]: Array<ProfileRecord> };
    profile?: {
        id: number;
        identity_id: number;
        organization_id: number;
    };
    bank_accounts?: Array<ProfileBankAccount>;
    count_vouchers: number;
    count_vouchers_active: number;
    count_vouchers_active_with_balance: number;
    created_at?: string;
    created_at_locale?: string;
    last_login_at?: string;
    last_login_at_locale?: string;
    last_activity_at?: string;
    last_activity_at_locale?: string;
}
