import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundProviderChat from '../props/models/FundProviderChat';
import FundProviderChatMessage from '../props/models/FundProviderChatMessage';

export class ProductChatService<T = FundProviderChat> {
    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public list(
        organization_id: number,
        product_id: number,
        query: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/products/${product_id}/chats`, query, config);
    }

    public show(
        organization_id: number,
        product_id: number,
        chat_id: number,
        query: object = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/products/${product_id}/chats/${chat_id}`, query);
    }

    public listMessages(
        organization_id: number,
        product_id: number,
        chat_id: number,
        query: object = {},
    ): Promise<ApiResponse<FundProviderChatMessage>> {
        return this.apiRequest.get(
            `${this.prefix}/${organization_id}/products/${product_id}/chats/${chat_id}/messages`,
            query,
        );
    }

    public storeMessage(
        organization_id: number,
        product_id: number,
        chat_id: number,
        query: object = {},
    ): Promise<ApiResponseSingle<FundProviderChatMessage>> {
        return this.apiRequest.post(
            `${this.prefix}/${organization_id}/products/${product_id}/chats/${chat_id}/messages`,
            query,
        );
    }
}

export default function useProductChatService(): ProductChatService {
    return useState(new ProductChatService())[0];
}
