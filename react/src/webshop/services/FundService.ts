import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { format } from 'date-fns';
import Fund from '../props/models/Fund';
import Voucher from '../../dashboard/props/models/Voucher';
import RecordType from '../../dashboard/props/models/RecordType';
import { Prefills } from '../components/pages/funds-request/FundRequest';

export class FundService<T = Fund> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/funds';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public apply(id: number): Promise<ApiResponseSingle<Voucher>> {
        return this.apiRequest.post(`${this.prefix}/${id}/apply`);
    }

    public check(id: number): Promise<
        ResponseSimple<{
            vouchers?: number;
            prevalidations?: number;
            prevalidation_vouchers?: Array<Voucher>;
            backoffice?: {
                backoffice_error?: number;
                backoffice_error_key?: string;
                backoffice_fallback?: boolean;
                backoffice_redirect?: string;
            };
        }>
    > {
        return this.apiRequest.post(`${this.prefix}/${id}/check`);
    }

    public request(id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${id}/request`, data);
    }

    public read(id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`, data);
    }

    public redeem(code: string): Promise<ResponseSimple<{ prevalidation: Array<T>; vouchers: Array<T> }>> {
        return this.apiRequest.post(`${this.prefix}/redeem`, { code });
    }

    public getPersonPrefills(id: number): Promise<ResponseSimple<Prefills>> {
        return this.apiRequest.get(`${this.prefix}/${id}/prefills`);
    }

    public getCriterionControlType(record_type: RecordType, operator = null) {
        const control_type =
            record_type.control_type === 'select' ? 'select_control' : `ui_control_${record_type.control_type}`;

        // for pre-check
        if (operator === null) {
            return record_type.type == 'string' && record_type.operators.find((operator) => operator.key == '=')
                ? 'ui_control_checkbox'
                : control_type;
        }

        // for fund request
        return record_type.type == 'string' && operator == '=' ? 'ui_control_checkbox' : control_type;
    }

    public getCriterionControlDefaultValue(record_type: RecordType, operator = null, init_date = true) {
        const control_type = this.getCriterionControlType(record_type, operator);

        return {
            ui_control_checkbox: null,
            ui_control_date: init_date ? format(new Date(), 'dd-MM-yyyy') : null,
            ui_control_step: record_type?.key == 'adults_nth' ? '1' : '0',
            ui_control_number: undefined,
            ui_control_currency: undefined,
            ui_control_text: '',
        }[control_type];
    }

    public getCriterionLabelValue(
        criteria_record: RecordType,
        value = null,
        translate: (key: string, params?: object) => string,
    ) {
        const trans_key = `fund_request.sign_up.record_checkbox.${criteria_record.key}`;
        const translated = translate(trans_key, { value });
        const trans_fallback_key = 'fund_request.sign_up.record_checkbox.default';

        return translated === trans_key ? translate(trans_fallback_key, { value: value }) : translated;
    }
}

export function useFundService(): FundService {
    return useState(new FundService())[0];
}
