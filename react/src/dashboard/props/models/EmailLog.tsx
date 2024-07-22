export default interface EmailLog {
    id: number;
    subject?: string;
    to_name?: string;
    to_address?: string;
    from_name?: string;
    from_address?: string;
    content?: string;
    created_at?: string;
    created_at_locale?: string;
}
