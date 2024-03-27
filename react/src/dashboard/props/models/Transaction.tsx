import Media from './Media';
import Product from './Product';
import Reservation from './Reservation';
import Voucher from './Voucher';
import Note from './Note';

export default interface Transaction {
    id: number;
    uid: string;
    organization_id: number;
    product_id?: number;
    address: string;
    state: 'success' | 'pending' | 'canceled';
    state_locale: string;
    payment_id?: string;
    iban_final: boolean;
    iban_to_name?: string;
    iban_from?: string;
    iban_to?: string;
    amount: string;
    amount_locale: string;
    timestamp: number;
    cancelable: boolean;
    transaction_in?: number;
    attempts: number;
    bulk_state?: 'draft' | 'error' | 'pending' | 'accepted' | 'rejected';
    bulk_state_locale?: string;
    fund: {
        id: number;
        name: string;
        organization_id: number;
        logo?: Media;
        organization_name: string;
    };
    notes?: Array<Note>;
    product?: Product;
    reservation?: Reservation;
    organization: {
        id: number;
        name: string;
        logo: Media;
    };
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
    voucher?: Voucher;
    voucher_transaction_bulk_id?: number;
    product_reservation?: Reservation;
    voucher_id?: number;
    target?: 'provider' | 'iban' | 'top_up';
    transaction_cost?: string;
    transaction_cost_locale?: string;
    branch_number?: number;
    branch_name?: string;
    branch_id?: string;
    non_cancelable_at_locale?: string;
}
