import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import PayoutTransaction from '../../dashboard/props/models/PayoutTransaction';

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
    public prefix = '/platform';

    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/payouts`, data);
    }

    public show(address: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/payouts/${address}`);
    }
}

export default function usePayoutTransactionService(): PayoutTransactionService {
    return useState(new PayoutTransactionService())[0];
}
