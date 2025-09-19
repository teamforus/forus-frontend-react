import PhysicalCardType from './PhysicalCardType';

export default interface FundPhysicalCardType {
    id: number;
    in_use: boolean;
    fund_id: number;
    physical_card_type: PhysicalCardType;
    physical_card_type_id: number;
    allow_physical_card_linking?: boolean;
    allow_physical_card_requests?: boolean;
    allow_physical_card_deactivation?: boolean;
}
