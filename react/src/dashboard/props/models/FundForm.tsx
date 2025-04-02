import Fund from './Fund';

export default interface FundForm {
    id: number;
    name?: string;
    fund?: Fund;
    steps?: number;
    state?: string;
    state_locale?: string;
    created_at?: string;
    created_at_locale?: string;
}
