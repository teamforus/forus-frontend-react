import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Transaction from '../props/models/Transaction';
import Papa from 'papaparse';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class TransactionService<T = Transaction> {
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

    /**
     * Fetch list
     */
    public list(
        type: string,
        organizationId: number,
        data: object = {},
    ): Promise<
        ApiResponse<T> & {
            data: { meta: { total_amount_locale?: string; total_amount?: string } };
        }
    > {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/${type}/transactions`, data);
    }

    /**
     * Fetch list
     */
    public show(type: string, organizationId: number, address: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/${type}/transactions/${address}`);
    }

    public makePayout(organizationId: number, data: object = {}): Promise<ApiResponseSingle<Transaction>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/transactions/payout`, data);
    }

    public updatePayout(
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
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/transactions/payouts/${address}`, data);
    }

    public makePayoutsBatch(organizationId: number, data: object = {}): Promise<ApiResponse<Transaction>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/transactions/payouts`, data);
    }

    public makePayoutsBatchValidate(organizationId: number, data: object = {}): Promise<ResponseSimple<null>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/transactions/payouts/validate`, data);
    }

    public storeBatch(organization_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/sponsor/transactions/batch`, {
            ...data,
        });
    }

    public storeBatchValidate(organization_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/sponsor/transactions/batch/validate`, {
            ...data,
        });
    }

    public sampleCsvTransactions() {
        const headers = ['voucher_id', 'amount', 'direct_payment_iban', 'direct_payment_name', 'uid', 'note'];
        const values = [1, 10, 'NLXXXXXXXXXXXXXXXX', 'XXXX XXXX', '', ''];

        return Papa.unparse([headers, values]);
    }

    public sampleCsvPayouts() {
        const headers = ['amount', 'target_iban', 'target_name', 'note'];
        const values = [1, 'NLXXXXXXXXXXXXXXXX', 'XXXX XXXX', ''];

        return Papa.unparse([headers, values]);
    }

    public export(type: string, organization_id: number, filters = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/${type}/transactions/export`, filters, {
            responseType: 'arraybuffer',
        });
    }

    public exportFields(type: string, organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/${type}/transactions/export-fields`);
    }

    public getPayoutColumns(): Array<ConfigurableTableColumn> {
        return [
            {
                key: 'id',
                value: 'id',
                label: 'payouts.labels.id',
                tooltip: { key: 'id', title: 'payouts.labels.id', description: 'payouts.tooltips.id' },
            },
            {
                key: 'fund',
                value: 'fund_name',
                label: 'payouts.labels.fund',
                tooltip: {
                    key: 'fund',
                    title: 'payouts.labels.fund',
                    description: 'payouts.tooltips.fund',
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
                key: 'methode',
                value: 'methode',
                label: 'payouts.labels.methode',
                tooltip: { key: 'methode', title: 'payouts.labels.methode', description: 'payouts.tooltips.methode' },
            },
            {
                key: 'status',
                value: 'state',
                label: 'payouts.labels.status',
                tooltip: { key: 'status', title: 'payouts.labels.status', description: 'payouts.tooltips.status' },
            },
            {
                key: 'bulk_state',
                value: 'bulk_state',
                label: 'payouts.labels.bulk_state',
                tooltip: {
                    key: 'bulk_state',
                    title: 'payouts.labels.bulk_state',
                    description: 'payouts.tooltips.bulk_state',
                },
            },
            {
                key: 'employee',
                value: 'employee_email',
                label: 'payouts.labels.employee',
                tooltip: {
                    key: 'employee',
                    title: 'payouts.labels.employee',
                    description: 'payouts.tooltips.employee',
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
        ];
    }
}

export default function useTransactionService(): TransactionService {
    return useState(new TransactionService())[0];
}
