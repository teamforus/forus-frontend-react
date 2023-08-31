import Organization from './Organization';
import Media from './Media';

export default interface Fund {
    id?: number;
    name?: string;
    logo?: Media;
    organization_id: number;
    organization?: Organization;
    products_count_all?: number;
    products_count_approved?: number;
    products_count_available?: number;
    state?: 'pending' | 'active' | 'closed';
    state_locale?: string;
}
