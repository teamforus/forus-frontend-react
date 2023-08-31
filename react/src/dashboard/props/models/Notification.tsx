export default interface Notification {
    id: string;
    title: string;
    description?: string;
    seen: boolean;
    type: string;
    created_at: string;
    created_at_locale: string;
}
