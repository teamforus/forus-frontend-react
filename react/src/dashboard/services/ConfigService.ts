import { ResponseProp } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Announcement from '../props/models/Announcement';

export type AppConfigProp = {
    add_money: boolean;
    validationRequests: boolean;
    event_permissions: {
        bank_connection: Array<string>;
        voucher: Array<string>;
        employee: Array<string>;
        fund: Array<string>;
    };
    organizations: {
        list: boolean;
        show: boolean;
        funds: {
            list: boolean;
            vouchers: {
                regular: boolean;
                products: boolean;
            };
            mustAcceptProducts: boolean;
            allowPrevalidations: boolean;
            allowValidationRequests: boolean;
            criteria: boolean;
            fund_requests: boolean;
            formula_products: boolean;
        };
        products: {
            list: boolean;
            hard_limit: number;
            soft_limit: number;
        };
    };
    media: {
        cms_media: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                public: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        fund_logo: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                large: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        office_photo: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                large: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        product_photo: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                small: [number, number, boolean];
                large: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        organization_logo: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                large: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        implementation_banner: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                medium: [number, number, boolean];
                large: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        reimbursement_file_preview: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        email_logo: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                large: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        implementation_block_media: {
            aspect_ratio: number;
            size: {
                thumbnail: [number, number, boolean];
                public: [number, number, boolean];
                large: [number, number, boolean];
                original: [number, number, boolean];
            };
        };
        [key: string]: {
            aspect_ratio: number;
            size: {
                [key: string]: [number, number, boolean];
            };
        };
    };
    has_budget_funds: boolean;
    has_subsidy_funds: boolean;
    has_reimbursements: boolean;
    announcements: Array<Announcement>;
    digid: boolean;
    digid_sign_up_allowed: boolean;
    digid_mandatory: boolean;
    digid_api_url: string;
    communication_type: 'formal' | 'informal';
    settings: {
        title: string;
        description: string;
        description_alignment: 'left' | 'center' | 'right';
        description_html: string;
        overlay_enabled: boolean;
        overlay_type: string;
        overlay_opacity: number;
        banner_text_color: string;
    };
    fronts: {
        url_webshop: string;
        url_sponsor: string;
        url_provider: string;
        url_validator: string;
        url_app: string;
    };
    map?: {
        lon?: number;
        lat?: number;
    };
    banner?: unknown;
    implementation_name?: string;
    products_hard_limit?: number;
    products_soft_limit?: number;
    pages: Array<unknown>;
    has_productboard_integration: boolean;
    social_medias: Array<unknown>;
    show_home_map: boolean;
    show_home_products: boolean;
    show_providers_map: boolean;
    show_provider_map: boolean;
    show_office_map: boolean;
    show_voucher_map: boolean;
    show_product_map: boolean;
};

export class ConfigService<T = AppConfigProp> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform';

    public get(type: string): Promise<ResponseProp<T>> {
        return this.apiRequest.get(`${this.prefix}/config/${type}`) as Promise<ResponseProp<T>>;
    }
}

export function useConfigService(): ConfigService {
    const [service] = useState(new ConfigService());

    return service;
}
