import { ProfileBankAccount, ProfileRecord, ProfileRecordTypes } from './Sponsor/SponsorIdentity';

export default interface Profile {
    bsn: boolean;
    email?: string;
    email_verified?: Array<string>;
    profile?: boolean;
    records?: { [key in ProfileRecordTypes]: Array<ProfileRecord> };
    bank_accounts?: Array<ProfileBankAccount>;
    created_at?: string;
    created_at_locale?: string;
    last_activity_at?: string;
    last_activity_at_locale?: string;
}
