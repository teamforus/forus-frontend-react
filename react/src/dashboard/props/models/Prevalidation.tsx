import PrevalidationRecord from './PrevalidationRecord';
import Fund from './Fund';

export default interface Prevalidation {
    id: number;
    records?: Array<PrevalidationRecord>;
    exported: boolean;
    fund_id: number;
    identity_address: string;
    records_hash: string;
    state: string;
    fund?: Fund;
    uid?: string;
    uid_hash?: string;
}
