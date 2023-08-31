export default interface IdentityEmail {
    id: number;
    email: string;
    primary: boolean;
    verified: boolean;
    identity_address: string;
    created_at_locale: string;
    created_at: string;
    updated_at: string;
    updated_at_locale: string;
}
