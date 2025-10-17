import Media from './Media';

export default interface PhysicalCardType {
    id: number;
    key?: string;
    name?: string;
    photo?: Media;
    in_use?: boolean;
    description?: string;
    code_prefix?: string;
    code_blocks?: number;
    code_block_size?: number;
    organization_id?: number;
    physical_cards_count: number;
    funds_count: number;
}
