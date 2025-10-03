import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import SponsorPhysicalCard from '../props/models/Sponsor/SponsorPhysicalCard';

export class PhysicalCardService<T = SponsorPhysicalCard> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/sponsor';

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix2 = '/platform/organizations';

    /**
     * Fetch list
     */
    public list(organization_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix2}/${organization_id}/physical-cards`, data);
    }

    public read(organization_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix2}/${organization_id}/physical-cards/${id}`, data);
    }

    public update(
        organization_id: number,
        id: number,
        data: Partial<T & { media_uid?: string }> = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix2}/${organization_id}/physical-cards/${id}`, data);
    }

    public store(organization_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix2}/${organization_id}/physical-cards`, data);
    }

    public destroy(organization_id: number, id: number): Promise<null> {
        return this.apiRequest.delete(`${this.prefix2}/${organization_id}/physical-cards/${id}`);
    }

    /**
     * Fetch by id
     */
    public readVoucher(organizationId: number, voucherId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/vouchers/${voucherId}/physical-cards`, data);
    }

    /**
     * Store
     */
    public storeVoucher(organizationId: number, voucherId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/vouchers/${voucherId}/physical-cards`, data);
    }

    /**
     * Delete by id
     */
    public deleteVoucher(organizationId: number, voucherId: number, id: number): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/vouchers/${voucherId}/physical-cards/${id}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['id', 'code', 'voucher', 'fund_name', 'type'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.physical_cards.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.physical_cards.labels.${key}`,
                description: `components.physical_cards.tooltips.${key}`,
            },
        }));
    }
}
export function usePhysicalCardService(): PhysicalCardService {
    return useState(new PhysicalCardService())[0];
}
