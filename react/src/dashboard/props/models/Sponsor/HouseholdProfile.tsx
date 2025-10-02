import SponsorIdentity from './SponsorIdentity';

export default interface HouseholdProfile {
    id: number;
    household_id: number;
    profile_id: number;
    created_at: string;
    created_at_locale: string;
    identity?: SponsorIdentity;
    updated_at: string;
    updated_at_locale: string;
}
