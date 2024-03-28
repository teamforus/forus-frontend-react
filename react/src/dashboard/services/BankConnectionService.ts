import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import BankConnection from '../props/models/BankConnection';

export class BankConnectionService<T = BankConnection> {
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
    public list(organization_id: number, query: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/bank-connections`, query);
    }

    public store(organization_id: number, query: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/bank-connections`, query);
    }

    public show(organization_id: number, connection_id: number, query: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/bank-connections/${connection_id}`, query);
    }

    public update(organization_id: number, connection_id: number, query: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/bank-connections/${connection_id}`, query);
    }
}

export function useBankConnectionService(): BankConnectionService {
    return useState(new BankConnectionService())[0];
}
