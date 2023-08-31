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
    roles: Array<Role>;
    permissions: Array<string>;
}
