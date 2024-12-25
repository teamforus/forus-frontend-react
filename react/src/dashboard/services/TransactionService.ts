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
        const headers = ['voucher_number', 'amount', 'direct_payment_iban', 'direct_payment_name', 'uid', 'note'];
        const values = ['XXXXXXXX', 10, 'NLXXXXXXXXXXXXXXXX', 'XXXX XXXX', '', ''];

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

    public getColumns(isSponsor: boolean, isProvider: boolean): Array<ConfigurableTableColumn> {
        const list = [
            'id',
            isSponsor ? 'uid' : null,
            'amount',
            isProvider ? 'method' : null,
            isProvider ? 'branch_name' : null,
            isProvider ? 'branch_number' : null,
            isProvider ? 'amount_extra' : null,
            'created_at',
            'fund_name',
            isProvider ? 'product_name' : null,
            isSponsor ? 'payment_type' : null,
            isSponsor ? 'provider_name' : null,
            isSponsor ? 'date_non_cancelable' : null,
            isSponsor ? 'bulk_id' : null,
            isSponsor ? 'bulk_state' : null,
            'state',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `transactions.labels.${key}`,
            tooltip: {
                key: key,
                title: `transactions.labels.${key}`,
                description: `transactions.tooltips.${key}`,
            },
        }));
    }
}

export default function useTransactionService(): TransactionService {
    return useState(new TransactionService())[0];
}
