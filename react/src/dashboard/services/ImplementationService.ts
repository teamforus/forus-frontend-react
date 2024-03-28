import { useState } from 'react';
import ApiResponse from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Implementation from '../props/models/Implementation';

export class ImplementationService<T = Implementation> {
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
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations`, data);
    }
}

export function useImplementationService(): ImplementationService {
    return useState(new ImplementationService())[0];
}
