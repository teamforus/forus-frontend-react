import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';

export class ContactService {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService = new ApiRequestService()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '';

    /**
     * Fetch list
     */
    public send(data: object = {}): Promise<object> {
        return this.apiRequest.post(`${this.prefix}/contact-form`, data);
    }
}

export function useContactService(): ContactService {
    return useState(new ContactService())[0];
}
