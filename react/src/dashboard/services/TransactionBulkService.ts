import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import TransactionBulk from '../props/models/TransactionBulk';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export class TransactionBulkService<T = TransactionBulk> {
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
    public list(organization_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/transaction-bulks`, data);
    }

    /**
     * Fetch list
     */
    public show(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/transaction-bulks/${id}`);
    }

    public bulkNow(organization_id: number, filters = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/sponsor/transaction-bulks`, filters);
    }

    // Reset bulk state and resend the payments to BUNQ
    public reset(organization_id: number, bulk_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/sponsor/transaction-bulks/${bulk_id}`, {
            state: 'pending',
        });
    }

    // Submit the payments to BNG
    public submit(organization_id: number, bulk_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/sponsor/transaction-bulks/${bulk_id}`, {
            state: 'pending',
        });
    }

    // set the bulk as paid
    public acceptManually(organization_id: number, bulk_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organization_id}/sponsor/transaction-bulks/${bulk_id}/set-accepted`,
        );
    }

    // export bulk details
    public export(organization_id: number, filters = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/transaction-bulks/export`, filters, {
            responseType: 'arraybuffer',
        });
    }

    // get export fields
    public exportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/transaction-bulks/export-fields`);
    }

    // export SEPA file
    public exportSepa(
        organization_id: number,
        bulk_id: number,
        filters: object = {},
    ): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(
            `${this.prefix}/${organization_id}/sponsor/transaction-bulks/${bulk_id}/export-sepa`,
            filters,
            { responseType: 'arraybuffer' },
        );
    }
}

export default function useTransactionBulkService(): TransactionBulkService {
    return useState(new TransactionBulkService())[0];
}
