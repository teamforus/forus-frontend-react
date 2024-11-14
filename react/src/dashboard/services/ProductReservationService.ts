import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Papa from 'papaparse';
import Reservation from '../props/models/Reservation';
import { ApiResponse, ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class ProductReservationService<T = Reservation> {
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

    public list(organization_id: number, data: object): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/product-reservations`, data);
    }

    public store(organization_id: number, data = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/product-reservations`, { ...data });
    }

    public storeBatch(organization_id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/product-reservations/batch`, { ...data });
    }

    public read(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/product-reservations/${id}`);
    }

    public accept(organization_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/product-reservations/${id}/accept`, data);
    }

    public reject(organization_id: number, id: number, data = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/product-reservations/${id}/reject`, data);
    }

    public destroy(organization_id: number, id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organization_id}/product-reservations/${id}`);
    }

    public exportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/product-reservations/export-fields`);
    }

    public export = (organization_id: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> => {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/product-reservations/export`, data, {
            responseType: 'arraybuffer',
        });
    };

    public archive(organization_id: number, id: number) {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/product-reservations/${id}/archive`);
    }

    public unarchive(organization_id: number, id: number) {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/product-reservations/${id}/unarchive`);
    }

    public fetchReservationExtraPayment(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/product-reservations/${id}/extra-payments/fetch`);
    }

    public refundReservationExtraPayment(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organization_id}/product-reservations/${id}/extra-payments/refund`,
        );
    }

    public sampleCsvProductReservations = (product_id = '') => {
        const headers = ['number', 'product_id'];
        const values = ['000000000000', product_id];

        return Papa.unparse([headers, values]);
    };

    public stateClass = (reservation: Reservation) => {
        return (
            {
                waiting: 'label-default',
                pending: 'label-default',
                accepted: 'label-success',
                rejected: 'label-danger',
                canceled: 'label-danger',
                canceled_by_client: 'label-danger',
                canceled_payment_expired: 'label-danger',
                canceled_payment_canceled: 'label-danger',
            }[reservation?.state] || 'label-default'
        );
    };

    public getColumns(showExtraPayments: boolean): Array<ConfigurableTableColumn> {
        const list = [
            'number',
            'product',
            'price',
            showExtraPayments ? 'amount_extra' : null,
            'customer',
            'reserved_at',
            'status',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `reservations.labels.${key}`,
            tooltip: {
                key: key,
                title: `reservations.labels.${key}`,
                description: `reservations.tooltips.${key}`,
            },
        }));
    }
}

export default function useProductReservationService(): ProductReservationService {
    return useState(new ProductReservationService())[0];
}
