import ApiRequestService from './ApiRequestService';
import { useState } from 'react';
import ApiResponse from '../props/ApiResponses';
import Notification from '../props/models/Notification';

export default class NotificationService<T = Notification> {
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

    public list(data = {}) {
        return this.apiRequest.get<ApiResponse<T>>(`${this.prefix}`, data, {
            'Client-Type': 'sponsor',
        });
    }
}

export function useNotificationService(): NotificationService {
    const [service] = useState(new NotificationService());

    return service;
}
