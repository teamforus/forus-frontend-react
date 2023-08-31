import ApiResponse from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Fund from '../props/models/Fund';

export class FundService<T = Fund> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations/';

    /**
     * Fetch list
     */
    public list(company_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix + company_id}/funds`, data);
    }

    public delete(company_id: number, data: object = {}): Promise<null> {
        return this.apiRequest.get<null>(`${this.prefix + company_id}/funds`, data);
    }
}

export function useFundService(): FundService {
    const [service] = useState(new FundService());

    return service;
}
