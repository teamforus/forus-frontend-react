import { ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';

export class FaqService {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService = new ApiRequestService()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    /**
     * Validate
     */
    public faqValidate(organizationId: number, data: object): Promise<ResponseSimple<null>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/faq/validate`, data);
    }
}
export default function useFaqService(): FaqService {
    return useState(new FaqService())[0];
}
