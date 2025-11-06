import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Implementation from '../props/models/Implementation';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class ImplementationService<T = Implementation> {
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
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations`, data);
    }

    /**
     * Store notification by id
     */
    public store(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/implementations`, data);
    }

    /**
     * Fetch by id
     */
    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations/${id}`);
    }

    /**
     * Update email branding
     */
    public updateEmailBranding(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/implementations/${id}/email-branding`, data);
    }

    /**
     * Update cms by id
     */
    public updateCMS(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/implementations/${id}/cms`, data);
    }

    /**
     * Update digid by id
     */
    public updateDigiD(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/implementations/${id}/digid`, data);
    }

    /**
     * Update email by id
     */
    public updateEmail(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/implementations/${id}/email`, data);
    }

    /**
     * Update pre-check banner by id
     */
    public updatePreCheckBanner(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/implementations/${id}/pre-check-banner`, data);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['name', 'implementation', 'state'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `implementation_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `implementation_funds.labels.${key}`,
                description: `implementation_funds.tooltips.${key}`,
            },
        }));
    }

    public getSocialMediaColumns(): Array<ConfigurableTableColumn> {
        const list = ['icon', 'type', 'url', 'title'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `implementation_social_media.labels.${key}`,
            tooltip: {
                key: key,
                title: `implementation_social_media.labels.${key}`,
                description: `implementation_social_media.tooltips.${key}`,
            },
        }));
    }
}

export default function useImplementationService(): ImplementationService {
    return useState(new ImplementationService())[0];
}
