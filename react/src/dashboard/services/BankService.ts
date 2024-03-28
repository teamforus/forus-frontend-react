import { useState } from 'react';
import ApiResponse from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Bank from '../props/models/Bank';

export class BankService<T = Bank> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/banks';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }
}

export function useBankService(): BankService {
    return useState(new BankService())[0];
}
