import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ImplementationSocialMedia from '../props/models/ImplementationSocialMedia';

export class ImplementationSocialMediaService<T = ImplementationSocialMedia> {
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
    public list(organizationId: number, implementationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/social-medias`,
            data,
        );
    }

    /**
     * Store
     */
    public store(organizationId: number, implementationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/social-medias`,
            data,
        );
    }

    /**
     * Fetch by id
     */
    public read(organizationId: number, implementationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/social-medias/${id}`,
        );
    }

    /**
     * Update by id
     */
    public update(
        organizationId: number,
        implementationId: number,
        id: number,
        data: object,
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/social-medias/${id}`,
            data,
        );
    }

    /**
     * Delete
     */
    public destroy(organizationId: number, implementationId: number, id: number): Promise<ApiResponse<null>> {
        return this.apiRequest.delete(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/social-medias/${id}`,
        );
    }
}
export default function useImplementationSocialMediaService(): ImplementationSocialMediaService {
    return useState(new ImplementationSocialMediaService())[0];
}
