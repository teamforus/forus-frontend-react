import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Fund from '../props/models/Fund';
import Product from '../props/models/Product';

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

    /**
     * Fetch by id
     */
    public read(company_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix + company_id}/funds/${id}`);
    }

    /**
     * Backoffice update
     */
    public backofficeUpdate(company_id: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix + company_id}/funds/${id}/backoffice`, data);
    }

    /**
     * Backoffice test
     */
    public backofficeTest(
        company_id: number,
        id: number,
    ): Promise<
        ResponseSimple<{
            state: string;
            response_code: number;
        }>
    > {
        return this.apiRequest.post(`${this.prefix + company_id}/funds/${id}/backoffice-test`);
    }

    /**
     * Delete
     */
    public destroy(company_id: number, id: number): Promise<ApiResponse<null>> {
        return this.apiRequest.delete(`${this.prefix + company_id}/funds/${id}`);
    }

    public getProviderProduct(
        organization_id: number,
        fund_id: number,
        provider_id: number,
        product_id: number,
        query: object = {},
    ): Promise<ApiResponseSingle<Product>> {
        return this.apiRequest.get(
            `${this.prefix}${organization_id}/funds/${fund_id}/providers/${provider_id}/products/${product_id}`,
            query,
        );
    }
}

export function useFundService(): FundService {
    return useState(new FundService())[0];
}
