import Media from './Media';

export default interface ExternalFund {
    id?: number;
    name?: string;
    logo?: Media;
    organization?: string;
    criteria: Array<{
        id: number;
        name: string;
        accepted: boolean;
    }>;
}
