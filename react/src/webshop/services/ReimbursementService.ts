import ApiResponse, { ApiResponseSingle, RequestConfig } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Reimbursement from '../props/models/Reimbursement';

export class ReimbursementService<T = Reimbursement> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/reimbursements';

    /**
     * Fetch list
     */
    public list(data: object = {}, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data, config);
    }

    public read(id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`, data);
    }

    public store(data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}`, data);
    }

    public update(id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${id}`, data);
    }

    public destroy(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${id}`);
    }
}

export function useReimbursementService(): ReimbursementService {
    return useState(new ReimbursementService())[0];
}
