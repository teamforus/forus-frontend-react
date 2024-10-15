import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Voucher from '../../dashboard/props/models/Voucher';

export class VoucherService<T = Voucher> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/vouchers';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public get(number: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${number}`);
    }

    public sendToEmail(number: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${number}/send-email`);
    }

    public shareVoucher(number: string, values = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${number}/share`, values);
    }

    public destroy(number: string): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${number}`);
    }

    public deactivate(number: string, data = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${number}/deactivate`, data);
    }
}

export function useVoucherService(): VoucherService {
    return useState(new VoucherService())[0];
}
