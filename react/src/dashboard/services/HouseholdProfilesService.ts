import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import HouseholdProfile from '../props/models/Sponsor/HouseholdProfile';

export class HouseholdProfilesService<T = HouseholdProfile> {
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
     * @param organizationId
     * @param householdId
     * @param query
     */
    public list(organizationId: number, householdId: number, query: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/sponsor/households/${householdId}/household-profiles`,
            query,
        );
    }

    /**
     * Store household member
     * @param organizationId
     * @param householdId
     * @param data
     */
    public store(organizationId: number, householdId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/households/${householdId}/household-profiles`,
            data,
        );
    }

    /**
     * Delete household member
     * @param organizationId
     * @param householdId
     * @param memberId
     */
    public delete(organizationId: number, householdId: number, memberId: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(
            `${this.prefix}/${organizationId}/sponsor/households/${householdId}/household-profiles/${memberId}`,
        );
    }
}

export default function useHouseholdProfilesService(): HouseholdProfilesService {
    return useState(new HouseholdProfilesService())[0];
}
