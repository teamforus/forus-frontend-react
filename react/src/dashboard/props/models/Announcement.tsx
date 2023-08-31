export default interface Announcement {
    id: number;
    type: string;
    title: boolean;
    description_html?: string;
    scope: string;
    dismissible: boolean;
}
