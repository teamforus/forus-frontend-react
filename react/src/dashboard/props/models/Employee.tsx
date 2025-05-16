import Role from './Role';

export default interface Employee {
    id: number;
    email?: string;
    identity_address: string;
    is_2fa_configured: boolean;
    organization_id: number;
    organization: {
        id: number;
        name: string;
    };
    office_id?: number;
    roles: Array<Role>;
    permissions: Array<string>;
    branch: {
        id: string;
        name: string;
        number: number;
        full_name: string;
    };
    created_at_locale?: string;
    last_activity_at_locale?: string;
}
