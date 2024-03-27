import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Fund from '../props/models/Fund';
import Product from '../props/models/Product';
import ProviderFinancialStatistics from './types/ProviderFinancialStatistics';
import FinancialOverview from './types/FinancialOverview';

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

    public readFinances(company_id: number, data: object = {}): Promise<ResponseSimple<ProviderFinancialStatistics>> {
        return this.apiRequest.get(`${this.prefix + company_id}/sponsor/finances`, data);
    }

    public financialOverview(company_id: number, data: object = {}): Promise<ResponseSimple<FinancialOverview>> {
        return this.apiRequest.get(`${this.prefix + company_id}/sponsor/finances-overview`, data);
    }

    public financialOverviewExport(company_id: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix + company_id}/sponsor/finances-overview-export`, data, {
            responseType: 'arraybuffer',
        });
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
