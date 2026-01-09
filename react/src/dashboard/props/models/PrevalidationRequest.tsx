import Fund from './Fund';

export default interface PrevalidationRequest {
    id: number;
    fund_id: number;
    state: string;
    bsn: string;
    identity_address: string;
    failed_reason?: string;
    failed_reason_locale?: string;
    fund?: Fund;
    employee: {
        id: number;
        email?: string;
        identity_address: string;
        organization_id: number;
    };
}
