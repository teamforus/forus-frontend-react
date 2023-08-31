export default interface Note {
    id: number;
    description?: string;
    created_at_locale?: string;
    employee?: {
        email?: string;
        identity_address?: string;
    };
}
