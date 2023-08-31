import ApiRequestService from './ApiRequestService';
import { useState } from 'react';
import { ApiResponseSingle } from '../props/ApiResponses';
import NotificationPreference from '../props/models/NotificationPreference';

export class EmailPreferenceService<T = NotificationPreference> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/notifications/settings';

    public get(): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(this.prefix);
    }

    public update(data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(this.prefix, data);
    }
}

export function useEmailPreferenceService(): EmailPreferenceService {
    const [service] = useState(new EmailPreferenceService());

    return service;
}
