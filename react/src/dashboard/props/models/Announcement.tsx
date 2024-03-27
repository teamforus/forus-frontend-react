export default interface Announcement {
    id: number;
    type: string;
    title: string;
    description_html?: string;
    scope: string;
    dismissible: boolean;
    expire_at?: string;
}
