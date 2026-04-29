import ApiRequestService from './ApiRequestService';
import { useState } from 'react';
import ApiResponse, { RequestConfig } from '../props/ApiResponses';
import Notification from '../props/models/Notification';

export class NotificationService<T = Notification> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/notifications';

    public list(data = {}, config: RequestConfig = {}): Promise<ApiResponse<T, { total_unseen: number }>> {
        return this.apiRequest.get(`${this.prefix}`, data, config);
    }
}

export function useNotificationService(): NotificationService {
    return useState(new NotificationService())[0];
}
