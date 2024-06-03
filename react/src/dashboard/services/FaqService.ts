import { useState } from 'react';
import { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import Faq from '../props/models/Faq';

export class FaqService<T = Faq> {
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
    public faqValidate(organization_id: number, faq: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/faq/validate`, { faq });
    }
}

export function useFaqService(): FaqService {
    return useState(new FaqService())[0];
}
