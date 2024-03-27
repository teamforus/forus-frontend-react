import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ImplementationPage from '../props/models/ImplementationPage';

export class ImplementationPageService<T = ImplementationPage> {
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
    public list(organizationId: number, id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations/${id}/pages`, data);
    }

    /**
     * Store page
     */
    public store(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/implementations/${id}/pages`, data);
    }

    /**
     * Fetch by id
     */
    public read(organizationId: number, implementationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations/${implementationId}/pages/${id}`);
    }

    /**
     * Update by id
     */
    public update(organizationId: number, id: number, page_id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/implementations/${id}/pages/${page_id}`, data);
    }

    /**
     * Delete
     */
    public destroy(organizationId: number, id: number, page_id: number): Promise<ApiResponse<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/implementations/${id}/pages/${page_id}`);
    }

    /**
     * Validate blocks
     */
    public validateBlocks(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/implementations/${id}/pages/validate-blocks`,
            data,
        );
    }

    public apiResourceToForm(apiResource: ImplementationPage) {
        return {
            state: apiResource.state,
            external: apiResource.external,
            blocks: apiResource.blocks,
            faq: apiResource.faq,
            page_type: apiResource.page_type,
            external_url: apiResource.external_url,
            blocks_per_row: apiResource.blocks_per_row,
            implementation_id: apiResource.implementation_id,
            description: apiResource.description,
            description_html: apiResource.description_html,
            description_position: apiResource.description_position,
            description_alignment: apiResource.description_alignment,
        };
    }
}
export default function useImplementationPageService(): ImplementationPageService {
    return useState(new ImplementationPageService())[0];
}
