import ExtraPayment from './ExtraPayment';
import Product from './Product';
import Transaction from './Transaction';
import FileModel from './File';

export default interface Reservation {
    id: number;
    code: string;
    amount_extra?: number;
    amount_extra_locale?: number;
    voucher_id?: number;
    extra_payment?: ExtraPayment;
    state?: string;
    state_locale?: string;
    expired?: boolean;
    product?: Product;
    price?: string;
    price_locale?: string;
    price_voucher?: string;
    price_voucher_locale?: string;
    amount?: string;
    amount_locale?: string;
    created_at?: string;
    created_at_locale?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    birth_date_locale?: string;
    identity_email?: string;
    identity_physical_card?: string;
    extra_payment_expires_in?: number;
    archivable?: boolean;
    archived?: boolean;
    canceled?: boolean;
    voucher_transaction: Transaction;
    accepted_at?: string;
    accepted_at_locale?: string;
    rejected_at?: string;
    rejected_at_locale?: string;
    expire_at?: string;
    expire_at_locale?: string;
    canceled_at?: string;
    canceled_at_locale?: string;
    user_note?: string;
    acceptable?: boolean;
    rejectable?: boolean;
    cancelable?: boolean;
    custom_fields?: Array<{
        label: string;
        value: string;
        file?: FileModel;
    }>;
    records_title?: string;
    fund: {
        id: number;
        name: string;
        organization: {
            id: number;
            name: string;
        };
    };
    cancellation_note?: string;
    rejection_note?: string;
    invoice_number?: string;
}
