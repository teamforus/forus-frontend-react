import { useState } from 'react';
import ApiRequestService from './ApiRequestService';

export class FeedbackService<T = null> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/feedback';

    /**
     * Store feedback
     */
    public store = (data: object = {}): Promise<null> => {
        return this.apiRequest.post(`${this.prefix}`, data);
    };
}

export default function useFeedbackService(): FeedbackService {
    return useState(new FeedbackService())[0];
}
