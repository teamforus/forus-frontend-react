import SponsorIdentity from './SponsorIdentity';

export default interface SponsorProfileRelation {
    id: number;
    // relations
    identity: SponsorIdentity;
    profile_id: number;
    identity_id: number;
    related_identity: SponsorIdentity;
    related_profile_id: number;
    related_identity_id: number;

    // props
    type: string;
    type_locale: string;
    subtype: string;
    subtype_locale: string;
    living_together: boolean;
    living_together_locale: boolean;

    // timestamps
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
}
