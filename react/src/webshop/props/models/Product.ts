import BaseProduct from '../../../dashboard/props/models/Product';

export default interface Product extends BaseProduct {
    reservation?: {
        address: 'no' | 'optional' | 'required';
        birth_date: 'no' | 'optional' | 'required';
        fields: Array<{
            id?: number;
            type?: 'text' | 'number';
            label?: string;
            required?: boolean;
            description?: string;
        }>;
        phone: 'no';
    };
}
