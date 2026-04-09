import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../../dashboard/props/ApiResponses';
import Provider from '../props/models/Provider';

export class ProviderService<T = Provider> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/providers';

    public search(data: object = {}, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(this.prefix, data, config);
    }

    public read(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`);
    }
}

export function useProviderService(): ProviderService {
    return useState(new ProviderService())[0];
}
