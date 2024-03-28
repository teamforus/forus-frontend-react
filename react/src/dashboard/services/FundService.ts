import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
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

    public delete(company_id: number, data: object = {}): Promise<null> {
        return this.apiRequest.get<null>(`${this.prefix + company_id}/funds`, data);
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

    public getLastSelectedFund(funds: Array<Fund> = []): Fund {
        const lastSelectedId = this.getLastSelectedFundId();

        return funds.find((fund) => fund.id == lastSelectedId) || funds?.[0] || null;
    }

    public getLastSelectedFundId(): number {
        return parseInt(localStorage.getItem('selected_fund_id'));
    }

    public setLastSelectedFund(fund: Fund) {
        return localStorage.setItem('selected_fund_id', fund?.id.toString());
    }
}

export function useFundService(): FundService {
    return useState(new FundService())[0];
}
