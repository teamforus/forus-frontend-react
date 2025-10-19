import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import PhysicalCard from '../../dashboard/props/models/PhysicalCard';

export class PhysicalCardsService<T = PhysicalCard> {
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

    public index(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/physical-cards`, data);
    }

    public store(voucher_number: string, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/vouchers/${voucher_number}/physical-cards`, data);
    }

    public destroy(voucher_number: string, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/vouchers/${voucher_number}/physical-cards/${id}`);
    }
}

export function usePhysicalCardsService(): PhysicalCardsService {
    return useState(new PhysicalCardsService())[0];
}
