import { ApiResponse, ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';

export type SearchItem = {
    id: number;
    name: string;
    description_text: string;
    item_type: 'fund' | 'product' | 'provider';
    resource: object;
};

export type SearchResultGroupItem = {
    id: number;
    name: string;
    item_type: 'fund' | 'product' | 'provider';
};

export type SearchResultGroup = {
    count: number;
    items: Array<SearchResultGroupItem>;
};

export type SearchResult = {
    funds: SearchResultGroup;
    products: SearchResultGroup;
    providers: SearchResultGroup;
};

export class SearchService<T = SearchResult> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/search';

    /**
     * Fetch list
     */
    public search(data: object = {}): Promise<ApiResponse<SearchItem>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    /**
     * Fetch list with overview
     */
    public searchWithOverview(data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}`, { ...data, overview: 1 });
    }
}

export function useSearchService(): SearchService {
    return useState(new SearchService())[0];
}
