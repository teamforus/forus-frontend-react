export default interface Household {
    id: number;
    uid: string;
    organization_id: number;
    living_arrangement?: string;
    count_people?: number;
    count_minors?: number;
    count_adults?: number;
    city?: string;
    street?: string;
    house_nr?: string;
    house_nr_addition?: string;
    postal_code?: string;
    neighborhood_name?: string;
    municipality_name?: string;
    members_count?: number;
    removable?: boolean;
    created_at?: string;
    updated_at?: string;
}
