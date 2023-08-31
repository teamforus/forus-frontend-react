import { useState } from 'react';
import ApiResponse from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Announcement from '../props/models/Announcement';

export class AnnouncementService<T = Announcement> {
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

    public list(organization_id: number, data: object = {}) {
        return this.apiRequest.get<ApiResponse<T>>(`${this.prefix}/${organization_id}/announcements`, data);
    }
}

export function useAnnouncementService(): AnnouncementService {
    const [service] = useState(new AnnouncementService());

    return service;
}
