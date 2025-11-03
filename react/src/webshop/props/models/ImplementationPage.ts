import ImplementationPageBlock from './ImplementationPageBlock';
import { WebshopRoutes } from '../../modules/state_router/RouterBuilder';

export default interface ImplementationPage {
    page_type?: WebshopRoutes;
    external: boolean;
    title?: string;
    description_position: 'after' | 'before' | 'replace';
    description_alignment: 'left' | 'center' | 'right';
    blocks_per_row: number;
    description: string;
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