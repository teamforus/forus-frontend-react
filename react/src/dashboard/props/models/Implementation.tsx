import Media from './Media';
import Announcement from './Announcement';
import ImplementationPage from './ImplementationPage';

export interface ImplementationPageType {
    key: string;
    type: string;
    blocks: boolean;
    faq: boolean;
    webshop_url: string;
    description_position_configurable: boolean;
}

export default interface Implementation {
    id: number;
    name: string;
    title?: string;
    description?: string;
    organization_id?: number;
    description_html?: string;
    description_alignment?: string;
    has_provider_terms_page: boolean;
    url_webshop?: string;
    logo?: string;
    email_from_name?: string;
    email_from_address?: string;
    digid_enabled?: boolean;
    digid_app_id?: string;
    digid_shared_secret?: string;
    digid_a_select_server?: string;
    informal_communication?: boolean;
    overlay_type?: string;
    overlay_enabled?: boolean;
    header_text_color?: string;
    pre_check_url?: string;
    communication_type?: string;
    overlay_opacity?: number;
    banner?: Media;
    pre_check_banner?: Media;
    announcement?: Announcement;
    page_types?: Array<ImplementationPageType>;
    show_home_map?: string;
    show_home_products?: string;
    show_provider_map?: string;
    show_providers_map?: string;
    show_office_map?: string;
    show_voucher_map?: string;
    show_product_map?: string;
    pages: Array<ImplementationPage>;
}
