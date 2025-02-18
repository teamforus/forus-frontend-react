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

export type ProfileRecordTypes =
    | 'given_name'
    | 'family_name'
    | 'telephone'
    | 'mobile'
    | 'birth_date'
    | 'city'
    | 'street'
    | 'house_number'
    | 'house_number_addition'
    | 'postal_code';

export type ProfileRecords = { [key in ProfileRecordTypes]: RecordType };
export type ProfileRecordValues = { [key in ProfileRecordTypes]: string };

export default interface SponsorIdentity {
    id: number;
    bsn?: string;
    email?: string;
    email_verified?: Array<string>;
    address?: string;
    records?: { [key in ProfileRecordTypes]: Array<ProfileRecord> };
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
