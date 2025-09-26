import ImplementationPageBlock from './ImplementationPageBlock';

export default interface ImplementationPage {
    page_type?: string;
    external: boolean;
    title?: string;
    description_position: 'after' | 'before' | 'replace';
    description_alignment: 'left' | 'center' | 'right';
    blocks_per_row: number;
    description_html: string;
    external_url: string;
    blocks: Array<ImplementationPageBlock>;
    faq: Array<{
        id: number;
        title: string;
        description: string;
        description_html: string;
    }>;
}