import Media from './Media';

export interface ImplementationPageBlock {
    id?: number;
    label?: string;
    title?: string;
    media?: Media;
    media_uid?: string;
    description?: string;
    description_html?: string;
    button_text?: string;
    button_link?: string;
    button_link_label?: string;
    button_enabled?: boolean;
    button_target_blank?: boolean;
}

export interface ImplementationPageFaq {
    id: number | string; // for sortablejs fake id
    title?: string;
    description?: string;
    description_html?: string;
}

export default interface ImplementationPage {
    id?: number;
    state?: string;
    blocks?: Array<ImplementationPageBlock>;
    faq?: Array<ImplementationPageFaq>;
    external?: boolean;
    page_type?: string;
    description?: string;
    external_url?: string;
    blocks_per_row?: number;
    description_html?: string;
    implementation_id?: number;
    description_position?: string;
    description_alignment?: string;
}
