import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Papa from 'papaparse';
import Reservation from '../props/models/Reservation';
import { ApiResponse, ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import Note from '../props/models/Note';

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

    public refundReservationExtraPayment(
        organization_id: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organization_id}/product-reservations/${id}/extra-payments/refund`,
            data,
        );
    }

    public listSponsor(organization_id: number, data: object): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/product-reservations`, data);
    }

    public update(organization_id: number, id: number, data = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/product-reservations/${id}`, data);
    }

    public updateCustomField(
        organization_id: number,
        reservation_id: number,
        id: number,
        data = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organization_id}/product-reservations/${reservation_id}/fields/${id}`,
            data,
        );
    }

    public sampleCsvProductReservations = (product_id = '') => {
        const headers = ['number', 'product_id'];
        const values = ['000000000000', product_id];

        return Papa.unparse([headers, values]);
    };

    public notes(organizationId: number, id: number, data: object): Promise<ApiResponse<Note>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/product-reservations/${id}/notes`, data);
    }

    public noteDestroy(organizationId: number, id: number, note_id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/product-reservations/${id}/notes/${note_id}`);
    }

    public storeNote(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<Note>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/product-reservations/${id}/notes`, data);
    }

    public getColumns(showExtraPayments: boolean, isSponsor: boolean): Array<ConfigurableTableColumn> {
        const list = [
            'code',
            'product',
            isSponsor ? 'provider' : null,
            'price',
            showExtraPayments ? 'amount_extra' : null,
            'customer',
            'created_at',
            'state',
            isSponsor ? 'transaction_id' : null,
            isSponsor ? 'transaction_state' : null,
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

    public getExtraPaymentRefundsColumns(): Array<ConfigurableTableColumn> {
        const list = ['refund_date', 'refund_amount', 'status'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `reservation.labels.${key}`,
            tooltip: {
                key: key,
                title: `reservation.labels.${key}`,
                description: `reservation.tooltips.${key}`,
            },
        }));
    }
}

export default function useProductReservationService(): ProductReservationService {
    return useState(new ProductReservationService())[0];
}
