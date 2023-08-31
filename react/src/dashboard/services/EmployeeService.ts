import ApiResponse, { ResponseSimple, ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import Employee from '../props/models/Employee';
import ApiRequestService from './ApiRequestService';

export class EmployeeService<T = Employee> {
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

    /**
     * Fetch list
     */
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/employees`, data) as Promise<ApiResponse<T>>;
    }

    /**
     * Store notification by id
     */
    public store(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/employees`, data) as Promise<
            ApiResponseSingle<T>
        >;
    }

    /**
     * Fetch by id
     */
    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/employees/${id}`) as Promise<ApiResponseSingle<T>>;
    }

    /**
     * Update by id
     */
    public update(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/employees/${id}`, data) as Promise<
            ApiResponseSingle<T>
        >;
    }

    /**
     * Delete by id
     */
    public delete(organizationId: number, id: number): Promise<null> {
        return this.apiRequest._delete(`${this.prefix}/${organizationId}/employees/${id}`) as Promise<null>;
    }

    public export(organizationId: number, data: object = {}): Promise<ResponseSimple<null>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/employees/export`,
            data,
            {},
            { responseType: 'arraybuffer' },
        );
    }
}
export function useEmployeeService(): EmployeeService {
    const [service] = useState(new EmployeeService());

    return service;
}
