import Fund from '../../props/models/Fund';
import Media from '../../../dashboard/props/models/Media';

export type PreCheckCriteria = {
    id: number;
    name: string;
    value?: string;
    is_valid: boolean;
    is_knock_out?: boolean;
    impact_level?: number;
    product_count?: number;
    knock_out_description?: string;
};

export type PreCheckTotalsFund = {
    id: number;
    name: string;
    description: string;
    description_short: string;
    external_link_text?: string;
    external_link_url?: string;
    is_external: boolean;
    logo?: Media;
    parent?: Fund;
    children?: Array<Fund>;
    criteria?: Array<PreCheckCriteria>;
    is_valid?: boolean;
    identity_multiplier?: number;
    allow_direct_requests?: boolean;
    amount_total?: string;
    amount_total_locale?: string;
    amount_for_identity?: string;
    amount_for_identity_locale?: string;
    pre_check_excluded?: boolean;
    pre_check_note?: string;
    fund_formula_products: {
        products: Array<{
            record: string;
            type: string;
            name: string;
            count: number;
        }>;
        items: Array<{
            record: string;
            type: string;
            value: string;
            count: number;
            total: string;
            amount: string;
        }>;
    };
};

export default interface PreCheckTotals {
    funds: Array<PreCheckTotalsFund>;
    funds_valid: Array<PreCheckTotalsFund>;
    amount_total: number;
    amount_total_locale: string;
    amount_total_valid: number;
    amount_total_valid_locale: string;
    products_amount_total: string;
    products_count_total: number;
}
