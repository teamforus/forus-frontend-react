import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Office from '../../dashboard/props/models/Office';

export class OfficeService<T = Office> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/offices';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public read(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`);
    }

    public scheduleWeekFullDays = (translate: (key: string) => string) => {
        // Day keys, starting with Monday as 0
        const dayKeys = ['0', '1', '2', '3', '4', '5', '6'];

        // Map each day key to its translated value
        return dayKeys.reduce(
            (acc, key) => {
                acc[parseInt(key)] = translate(`week_days.${key}`);
                return acc;
            },
            {} as Record<number, string>,
        );
    };
}

export function useOfficeService(): OfficeService {
    return useState(new OfficeService())[0];
}
