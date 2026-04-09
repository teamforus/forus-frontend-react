import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Reservation from '../../dashboard/props/models/Reservation';

export class ProductReservationService<T = Reservation> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/product-reservations';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public read(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`);
    }

    public validate(data: object): Promise<null> {
        return this.apiRequest.post(`${this.prefix}/validate`, data);
    }
    public validateFields(data: object): Promise<null> {
        return this.apiRequest.post(`${this.prefix}/validate-fields`, data);
    }

    public validateAddress(data: object): Promise<null> {
        return this.apiRequest.post(`${this.prefix}/validate-address`, data);
    }

    public reserve(
        data: object,
    ): Promise<ApiResponseSingle<T> & ResponseSimple<{ id?: number; checkout_url?: string }>> {
        return this.apiRequest.post(`${this.prefix}`, data);
    }

    public cancel(id: number, values = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${id}/cancel`, values);
    }

    public checkoutExtra(id: number): Promise<ResponseSimple<{ url: string }>> {
        return this.apiRequest.post(`${this.prefix}/${id}/extra-payment/checkout`);
    }
}

export function useProductReservationService(): ProductReservationService {
    return useState(new ProductReservationService())[0];
}
