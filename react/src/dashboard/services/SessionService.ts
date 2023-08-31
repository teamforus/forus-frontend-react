import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Session from '../props/models/Session';

export class SessionService<T = Session> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/identity/sessions';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public read(uid: string): Promise<ApiResponseSingle<Session>> {
        return this.apiRequest.get(`${this.prefix}/${uid}`);
    }

    public terminate(uid: string): Promise<null> {
        return this.apiRequest.patch(`${this.prefix}/${uid}/terminate`);
    }

    public terminateAll(): Promise<null> {
        return this.apiRequest.patch(`${this.prefix}/terminate`);
    }
}

export function useSessionService(): SessionService {
    const [service] = useState(new SessionService());

    return service;
}
