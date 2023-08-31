import ApiResponse from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Role from '../props/models/Role';

export class RoleService<T = Role> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/roles';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data) as Promise<ApiResponse<T>>;
    }
}

export function useRoleService(): RoleService {
    const [service] = useState(new RoleService());

    return service;
}
