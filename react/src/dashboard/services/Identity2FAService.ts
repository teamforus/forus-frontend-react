import ApiRequestService from './ApiRequestService';
import { useState } from 'react';
import Identity2FAState from '../props/models/Identity2FAState';
import { ApiResponseSingle } from '../props/ApiResponses';
import Identity2FA from '../props/models/Identity2FA';

export default class Identity2FAService<T = Identity2FAState> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/identity/2fa';

    public status(data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public update(data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/update`, data);
    }

    public store(data: object = {}): Promise<ApiResponseSingle<Identity2FA>> {
        return this.apiRequest.post(`${this.prefix}`, data);
    }

    public send(uuid: string, data: object = {}): Promise<ApiResponseSingle<Identity2FA>> {
        return this.apiRequest.post(`${this.prefix}/${uuid}/resend`, data);
    }

    public activate(uuid: string, data: object = {}): Promise<ApiResponseSingle<Identity2FA>> {
        return this.apiRequest.post(`${this.prefix}/${uuid}/activate`, data);
    }

    public deactivate(uuid: string, data: object = {}): Promise<ApiResponseSingle<Identity2FA>> {
        return this.apiRequest.post(`${this.prefix}/${uuid}/deactivate`, data);
    }

    public authenticate(uuid: string, data: object = {}): Promise<ApiResponseSingle<Identity2FA>> {
        return this.apiRequest.post(`${this.prefix}/${uuid}/authenticate`, data);
    }
}

export function useIdentity2FAService(): Identity2FAService {
    const [service] = useState(new Identity2FAService());

    return service;
}
