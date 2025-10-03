import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import PhysicalCardType from '../props/models/PhysicalCardType';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class PhysicalCardTypeService<T = PhysicalCardType> {
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
    public list(organization_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/physical-card-types`, data);
    }

    public read(organization_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/physical-card-types/${id}`, data);
    }

    public update(
        organization_id: number,
        id: number,
        data: Partial<T & { media_uid?: string }> = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/physical-card-types/${id}`, data);
    }

    public store(organization_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/physical-card-types`, data);
    }

    public destroy(organization_id: number, id: number): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${organization_id}/physical-card-types/${id}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['name', 'funds_count', 'cards_count', 'code_blocks', 'code_block_size'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.physical_card_types.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.physical_card_types.labels.${key}`,
                description: `components.physical_card_types.tooltips.${key}`,
            },
        }));
    }
}

export function usePhysicalCardTypeService(): PhysicalCardTypeService {
    return useState(new PhysicalCardTypeService())[0];
}
