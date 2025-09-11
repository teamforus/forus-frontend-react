export default interface Faq {
    id?: number;
    type?: 'question' | 'title';
    title?: string;
    subtitle?: string;
    description?: string;
    description_html?: string;
}
