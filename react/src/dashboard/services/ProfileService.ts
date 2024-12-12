import ApiRequestService from './ApiRequestService';
import { useState } from 'react';
import { ResponseSimple } from '../props/ApiResponses';
import { ProfileRecordValues } from '../props/models/Sponsor/SponsorIdentity';
import Profile from '../props/models/Profile';

export default class ProfileService<T = Profile> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/profile';

    public profile(): Promise<ResponseSimple<T>> {
        return this.apiRequest.get(this.prefix);
    }

    public update(data: Partial<ProfileRecordValues>): Promise<ResponseSimple<T>> {
        return this.apiRequest.patch(this.prefix, data);
    }
}

export function useProfileService(): ProfileService {
    return useState(new ProfileService())[0];
}
