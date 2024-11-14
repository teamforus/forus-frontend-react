import Media from '../Media';

export default interface FundTiny {
    id: number;
    type?: string;
    name?: string;
    logo?: Media;
    organization_id?: number;
    organization_name?: string;
}
