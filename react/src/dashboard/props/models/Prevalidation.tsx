import PrevalidationRecord from './PrevalidationRecord';

export default interface Prevalidation {
    id: number;
    records?: Array<PrevalidationRecord>;
    exported: boolean;
    fund_id: number;
    identity_address: string;
    records_hash: string;
    state: string;
    uid: string;
    uid_hash: string;
    collection: string;
    db: string;
}
