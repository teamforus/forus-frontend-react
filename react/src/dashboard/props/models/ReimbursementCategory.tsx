import Organization from './Organization';

export default interface ReimbursementCategory {
    id: number;
    name: string;
    organization?: Organization;
    reimbursements_count?: number;
}
