import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import Tag from '../props/models/Tag';

export class TagService<T = Tag> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/tags';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    /**
     * Fetch list
     */
    public show(tagId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${tagId}`, data);
    }
}

export function useTagService(): TagService {
    return useState(new TagService())[0];
}
