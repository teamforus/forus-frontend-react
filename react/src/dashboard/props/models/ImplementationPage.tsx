import Faq from './Faq';
import ImplementationPageBlock from './ImplementationPageBlock';

export default interface ImplementationPage {
    id?: number;
    state?: string;
    blocks?: Array<ImplementationPageBlock>;
    faq?: Array<Faq>;
    external?: boolean;
    page_type?: string;
    title?: string;
    description?: string;
    external_url?: string;
    blocks_per_row?: number;
    description_html?: string;
    implementation_id?: number;
    description_position?: string;
    description_alignment?: 'left' | 'center' | 'right';
    implementation?: { id: number; name: string; organization_id: number; url_webshop: string };
}
