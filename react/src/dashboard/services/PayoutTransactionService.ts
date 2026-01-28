import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Transaction from '../props/models/Transaction';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import Papa from 'papaparse';
import PayoutTransaction from '../props/models/PayoutTransaction';
import PayoutBankAccount from '../props/models/PayoutBankAccount';

export class PayoutTransactionService<T = PayoutTransaction> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/payouts`, data);
    }

    public bankAccounts(organizationId: number, data: object = {}): Promise<ApiResponse<PayoutBankAccount>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/payouts/bank-accounts`, data);
    }

    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<Transaction>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/payouts`, data);
    }

    public update(
        organizationId: number,
        address: string,
        data: {
            cancel?: boolean;
            skip_transfer_delay?: boolean;
            note?: string;
            amount?: string;
            amount_preset_id?: number;
            target_name?: string;
            target_iban?: string;
        } = {},
    ): Promise<ApiResponseSingle<Transaction>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/payouts/${address}`, data);
    }

    public show(type: string, organizationId: number, address: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/${type}/payouts/${address}`);
    }

    public storeBatch(organizationId: number, data: object = {}): Promise<ApiResponse<Transaction>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/payouts/batch`, data);
    }

    public storeBatchValidate(organizationId: number, data: object = {}): Promise<ResponseSimple<null>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/payouts/batch/validate`, data);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        return [
            {
                key: 'id',
                value: 'id',
                label: 'payouts.labels.id',
                tooltip: { key: 'id', title: 'payouts.labels.id', description: 'payouts.tooltips.id' },
            },
            {
                key: 'fund_name',
                value: 'fund_name',
                label: 'payouts.labels.fund_name',
                tooltip: {
                    key: 'fund_name',
                    title: 'payouts.labels.fund_name',
                    description: 'payouts.tooltips.fund_name',
                },
            },
            {
                key: 'amount',
                value: 'amount',
                label: 'payouts.labels.amount',
                tooltip: { key: 'amount', title: 'payouts.labels.amount', description: 'payouts.tooltips.amount' },
            },
            {
                key: 'created_at',
                value: 'created_at',
                label: 'payouts.labels.created_at',
                tooltip: {
                    key: 'created_at',
                    title: 'payouts.labels.created_at',
                    description: 'payouts.tooltips.created_at',
                },
            },
            {
                key: 'transfer_at',
                value: 'transfer_at',
                label: 'payouts.labels.transfer_at',
                tooltip: {
                    key: 'transfer_at',
                    title: 'payouts.labels.transfer_at',
                    description: 'payouts.tooltips.transfer_at',
                },
            },
            {
                key: 'payment_type',
                value: 'payment_type',
                label: 'payouts.labels.payment_type',
                tooltip: {
                    key: 'payment_type',
                    title: 'payouts.labels.payment_type',
                    description: 'payouts.tooltips.payment_type',
                },
            },
            {
                key: 'relation',
                value: 'relation',
                label: 'payouts.labels.relation',
                tooltip: {
                    key: 'relation',
                    title: 'payouts.labels.relation',
                    description: 'payouts.tooltips.relation',
                },
            },
            {
                key: 'state',
                value: 'state',
                label: 'payouts.labels.state',
                tooltip: { key: 'state', title: 'payouts.labels.state', description: 'payouts.tooltips.state' },
            },
            {
                key: 'employee_email',
                value: 'employee_email',
                label: 'payouts.labels.employee_email',
                tooltip: {
                    key: 'employee_email',
                    title: 'payouts.labels.employee_email',
                    description: 'payouts.tooltips.employee_email',
                },
            },
            {
                key: 'target_iban',
                value: 'target_iban',
                label: 'payouts.labels.target_iban',
                tooltip: {
                    key: 'target_iban',
                    title: 'payouts.labels.target_iban',
                    description: 'payouts.tooltips.target_iban',
                },
            },
            {
                key: 'description',
                value: 'description',
                label: 'payouts.labels.description',
                tooltip: {
                    key: 'description',
                    title: 'payouts.labels.description',
                    description: 'payouts.tooltips.description',
                },
            },
        ];
    }

    public sampleCsv() {
        const headers = ['amount', 'target_iban', 'target_name', 'description', 'bsn', 'email'];
        const values = [1, 'NLXXXXXXXXXXXXXXXX', 'XXXX XXXX', '', '', ''];

        return Papa.unparse([headers, values]);
    }
}

export default function usePayoutTransactionService(): PayoutTransactionService {
    return useState(new PayoutTransactionService())[0];
}
