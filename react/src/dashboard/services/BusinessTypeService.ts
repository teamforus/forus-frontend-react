import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import BusinessType from '../props/models/BusinessType';

export class BusinessTypeService<T = BusinessType> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/business-types';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    /**
     * Fetch list
     */
    public show(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`);
    }
}

export function useBusinessTypeService(): BusinessTypeService {
    const [service] = useState(new BusinessTypeService());

    return service;
}
