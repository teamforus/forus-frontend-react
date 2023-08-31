import ApiRequestService from './ApiRequestService';
import Identity from '../props/models/Identity';
import { useState } from 'react';
import { ResponseSimple, ApiResponseSingle } from '../props/ApiResponses';

export default class IdentityService<T = Identity> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/identity';

    public identity() {
        return this.apiRequest.get<ApiResponseSingle<T>>(this.prefix);
    }

    public make(data = {}) {
        return this.apiRequest.post<ResponseSimple<{ address: string }>>(this.prefix, data);
    }

    public validateEmail(data = {}) {
        return this.apiRequest.post<
            ResponseSimple<{
                email: {
                    used: boolean;
                    unique: boolean;
                    valid: boolean;
                };
            }>
        >(`${this.prefix}/validate/email`, data);
    }

    public deleteToken() {
        return this.apiRequest._delete<ResponseSimple<null>>(`${this.prefix}/delete`);
    }

    public makeAuthToken() {
        return this.apiRequest.post<ResponseSimple<{ auth_token: string; access_token: string }>>(
            `${this.prefix}/proxy/token`,
        );
    }

    public makeAuthPinCode() {
        return this.apiRequest.post<ResponseSimple<{ auth_token: string; access_token: string }>>(
            `${this.prefix}/proxy/code`,
        );
    }

    public makeAuthEmailToken(email: string, source: string, target?: string) {
        return this.apiRequest.post<ResponseSimple<null>>(`${this.prefix}/proxy/email`, { email, target, source });
    }

    public checkAccessToken(access_token: string) {
        return this.apiRequest.get<ResponseSimple<{ message: 'pending' | 'active' | 'invalid' }>>(
            `${this.prefix}/proxy/check-token`,
            {},
            { 'Access-Token': access_token },
        );
    }

    public exchangeShortToken(exchange_token: string) {
        return this.apiRequest.get<ResponseSimple<{ access_token: string }>>(
            `${this.prefix}/proxy/short-token/${exchange_token}`,
        );
    }

    public authorizeAuthToken(auth_token: string) {
        return this.apiRequest.post<ResponseSimple<{ success: boolean }>>(`${this.prefix}/proxy/authorize/token`, {
            auth_token,
        });
    }

    public authorizeAuthCode(auth_code: string) {
        return this.apiRequest.post<ResponseSimple<{ success: boolean }>>(`${this.prefix}/proxy/authorize/code`, {
            auth_code,
        });
    }

    public authorizeAuthEmailToken(email_token: string) {
        return this.apiRequest.get<ResponseSimple<{ access_token: string }>>(
            `${this.prefix}/proxy/email/exchange/${email_token}`,
        );
    }

    public exchangeConfirmationToken(exchange_token: string) {
        return this.apiRequest.get<ResponseSimple<{ access_token: string }>>(
            `${this.prefix}/proxy/confirmation/exchange/${exchange_token}`,
        );
    }
}

export function useIdentityService(): IdentityService {
    const [service] = useState(new IdentityService());

    return service;
}
