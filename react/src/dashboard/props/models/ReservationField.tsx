export default interface ReservationField {
    id?: number;
    type: 'text' | 'number' | 'boolean' | 'file';
    product_id?: number;
    organization_id?: number;
    label: string;
    description: string;
    required: boolean;
    order?: number;
    fillable_by?: 'provider' | 'requester';
}
