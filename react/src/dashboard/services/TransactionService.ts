import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Transaction from '../props/models/Transaction';
import Papa from 'papaparse';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

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
        const headers = ['voucher_id', 'amount', 'direct_payment_iban', 'direct_payment_name', 'uid', 'note'];
        const values = [1, 10, 'NLXXXXXXXXXXXXXXXX', 'XXXX XXXX', '', ''];

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
}

export default function useTransactionService(): TransactionService {
    return useState(new TransactionService())[0];
}
