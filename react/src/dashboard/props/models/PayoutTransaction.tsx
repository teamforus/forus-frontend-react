import Media from './Media';

export default interface PayoutTransaction {
    id: number;
    state: 'success' | 'pending' | 'canceled';
    state_locale: string;
    address: string;
    employee_id?: number;
    upload_batch_id?: number;
    iban_final?: boolean;
    target?: 'provider' | 'iban' | 'top_up' | 'payout';
    target_locale?: string;
    description?: string;
    iban_from?: string;
    iban_to?: string;
    iban_to_name?: string;
    created_at: string;
    created_at_locale: string;
    transfer_at?: string;
    transfer_at_locale?: string;
    updated_at?: string;
    updated_at_locale?: string;
    amount: string;
    amount_locale: string;
    amount_preset_id?: number;
    transfer_in?: number;
    transfer_in_pending?: boolean;
    fund: {
        id: number;
        name: string;
        organization_id: number;
        logo?: Media;
        organization_name: string;
    };
    employee?: {
        id?: string;
        email?: string;
        address?: string;
    };
    is_editable?: boolean;
    is_cancelable?: boolean;
    payout_relations?: Array<{
        id: number;
        type: 'email' | 'bsn';
        value: string;
    }>;
    payment_type_locale?: {
        title: string;
        subtitle: string;
    };
}
