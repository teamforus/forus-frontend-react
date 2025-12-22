import BaseProduct from '../../../dashboard/props/models/Product';

export default interface Product extends BaseProduct {
    reservation?: {
        address: 'no' | 'optional' | 'required';
        birth_date: 'no' | 'optional' | 'required';
        note: 'no' | 'optional';
        fields: Array<{
            id?: number;
            type?: 'text' | 'number' | 'boolean' | 'file';
            label?: string;
            required?: boolean;
            description?: string;
        }>;
        phone: 'no';
    };
}
