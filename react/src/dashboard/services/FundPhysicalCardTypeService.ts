import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundPhysicalCardType from '../props/models/FundPhysicalCardType';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class FundPhysicalCardTypeService<T = FundPhysicalCardType> {
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

    public list(organization_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/fund-physical-card-types`, data);
    }

    public store(organization_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/fund-physical-card-types`, data);
    }

    public update(organization_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/fund-physical-card-types/${id}`, data);
    }

    public delete(organization_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${organization_id}/fund-physical-card-types/${id}`, data);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = [
            'name',
            'allow_physical_card_linking',
            'allow_physical_card_deactivation',
            'allow_physical_card_requests',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.fund_physical_card_types.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.fund_physical_card_types.labels.${key}`,
                description: `components.fund_physical_card_types.tooltips.${key}`,
            },
        }));
    }
}

export function useFundPhysicalCardTypeService(): FundPhysicalCardTypeService {
    return useState(new FundPhysicalCardTypeService())[0];
}
