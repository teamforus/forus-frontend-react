import ApiRequestService from './ApiRequestService';
import { useState } from 'react';
import IdentityEmail from '../props/models/IdentityEmail';
import { ApiResponse, ApiResponseSingle } from '../props/ApiResponses';

export default class IdentityEmailService<T = IdentityEmail> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/identity/emails';

    public list(): Promise<ApiResponse<T>> {
        return this.apiRequest.get(this.prefix);
    }

    public store(email: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(this.prefix, { email });
    }

    public show(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get('/identity/emails/' + id);
    }

    public delete(id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest._delete('/identity/emails/' + id);
    }

    public resendVerification(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post('/identity/emails/' + id + '/resend');
    }

    public makePrimary(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch('/identity/emails/' + id + '/primary');
    }
}

export function useIdentityEmailsService(): IdentityEmailService {
    const [service] = useState(new IdentityEmailService());

    return service;
}
