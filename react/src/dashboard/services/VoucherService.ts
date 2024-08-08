import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Voucher from '../props/models/Voucher';
import Papa from 'papaparse';
import Product from '../props/models/Product';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';
import Transaction from '../props/models/Transaction';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class VoucherService<T = Voucher> {
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
    public index(organizationId: number, query: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/vouchers`, query);
    }

    public readProvider(address: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`/platform/provider/vouchers/${address}`);
    }

    public readProviderProducts(address: string, query: object = {}): Promise<ApiResponse<Product>> {
        return this.apiRequest.get(`/platform/provider/vouchers/${address}/products`, query);
    }

    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/vouchers`, data);
    }

    public storeValidate(organizationId: number, data: object = {}): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/vouchers/validate`, data);
    }

    public storeCollection(organizationId: number, fund_id: number, vouchers: Array<object>): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/vouchers/batch`, {
            fund_id: fund_id,
            vouchers: vouchers,
        });
    }

    public storeCollectionValidate(
        organizationId: number,
        fund_id: number,
        vouchers: Array<object>,
    ): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/vouchers/batch/validate`, {
            fund_id: fund_id,
            vouchers: vouchers,
        });
    }

    public show(organizationId: number, voucher_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}`);
    }

    public update(organizationId: number, voucher_id: number, query: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}`, query);
    }

    public sendToEmail(organizationId: number, voucher_id: number, email: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/send`, {
            email,
        });
    }

    public assign(organizationId: number, voucher_id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/assign`, data);
    }

    public activate(organizationId: number, voucher_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/activate`, data);
    }

    public deactivate(organizationId: number, voucher_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/deactivate`,
            data,
        );
    }

    public makeActivationCode(
        organizationId: number,
        voucher_id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/activation-code`,
            data,
        );
    }

    public export(
        organizationId: number,
        filters = {},
    ): Promise<{
        data: { data: Array<{ name?: string; value?: string }>; files: { csv: string; zip: string }; name: string };
    }> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/vouchers/export`, filters);
    }

    public exportFields(
        organizationId: number,
        filters: object = {},
    ): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/vouchers/export-fields`, filters);
    }

    public makeSponsorTransaction(organizationId: number, data: object = {}): Promise<ApiResponseSingle<Transaction>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/transactions`, data);
    }

    public sampleCSVBudgetVoucher(expires_at = '2020-02-20'): string {
        const headers = ['amount', 'expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
        const values = [10, expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

        return Papa.unparse([headers, values]);
    }

    public sampleCSVSubsidiesVoucher(expires_at = '2020-02-20'): string {
        const headers = ['expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
        const values = [expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

        return Papa.unparse([headers, values]);
    }

    public sampleCSVProductVoucher(product_id = null, expires_at = '2020-02-20'): string {
        const headers = ['product_id', 'expires_at', 'note', 'email', 'activate', 'activation_code', 'client_uid'];
        const values = [product_id, expires_at, 'voorbeeld notitie', 'test@example.com', 0, 0, ''];

        return Papa.unparse([headers, values]);
    }

    public getStates(): Array<{ value: string; name: string }> {
        return [
            { value: null, name: 'Alle' },
            { value: 'pending', name: 'Inactief' },
            { value: 'active', name: 'Actief' },
            { value: 'deactivated', name: 'Gedeactiveerd' },
            { value: 'expired', name: 'Verlopen' },
        ];
    }

    public getGrantedOptions(): Array<{ value: number; name: string }> {
        return [
            { value: null, name: 'Selecteer...' },
            { value: 1, name: 'Ja' },
            { value: 0, name: 'Nee' },
        ];
    }

    public getSourcesOptions(): Array<{ value: string; name: string }> {
        return [
            { value: 'all', name: 'Alle' },
            { value: 'user', name: 'Gebruiker' },
            { value: 'employee', name: 'Medewerker' },
        ];
    }

    public getInUseOptions(): Array<{ value: number; name: string }> {
        return [
            { value: null, name: 'Selecteer...' },
            { value: 1, name: 'Ja' },
            { value: 0, name: 'Nee' },
        ];
    }

    public getHasPayoutsOptions(): Array<{ value: number; name: string }> {
        return [
            { value: null, name: 'Selecteer...' },
            { value: 1, name: 'Ja' },
            { value: 0, name: 'Nee' },
        ];
    }

    public getDateTypesOptions(): Array<{ value: string; name: string }> {
        return [
            { value: 'created_at', name: 'Aanmaakdatum' },
            { value: 'used_at', name: 'Transactiedatum' },
        ];
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        return [
            {
                key: 'id',
                label: 'vouchers.labels.id',
                tooltip: { key: 'id', title: 'ID / NR', description: 'vouchers.tooltips.id' },
            },
            {
                key: 'assigned_to',
                label: 'vouchers.labels.assigned_to',
                tooltip: { key: 'assigned_to', title: 'Methode', description: 'vouchers.tooltips.assigned_to' },
            },
            {
                key: 'source',
                label: 'vouchers.labels.source',
                tooltip: { key: 'source', title: 'Aangemaakt door', description: 'vouchers.tooltips.source' },
            },
            {
                key: 'type_voucher',
                label: 'vouchers.labels.type_voucher',
                tooltip: { key: 'type_voucher', title: 'Type', description: 'vouchers.tooltips.type_voucher' },
            },
            {
                key: 'type_credit',
                label: 'vouchers.labels.type_credit',
                tooltip: { key: 'type_credit', title: 'Soort tegoed', description: 'vouchers.tooltips.type_credit' },
            },
            {
                key: 'note',
                label: 'vouchers.labels.note',
                tooltip: { key: 'note', title: 'Notitie', description: 'vouchers.tooltips.note' },
            },
            {
                key: 'fund',
                label: 'vouchers.labels.fund',
                tooltip: { key: 'fund', title: 'Fonds', description: 'vouchers.tooltips.fund' },
            },
            {
                key: 'created_at',
                label: 'vouchers.labels.created_at',
                tooltip: { key: 'created_at', title: 'Aangemaakt op', description: 'vouchers.tooltips.created_at' },
            },
            {
                key: 'expire_at',
                label: 'vouchers.labels.expire_at',
                tooltip: { key: 'expire_at', title: 'Geldig tot en met', description: 'vouchers.tooltips.expire_at' },
            },
            {
                key: 'in_use',
                label: 'vouchers.labels.in_use',
                tooltip: { key: 'in_use', title: 'In gebruik', description: 'vouchers.tooltips.in_use' },
            },
            {
                key: 'has_payouts',
                label: 'vouchers.labels.has_payouts',
                tooltip: {
                    key: 'has_payouts',
                    title: 'Heeft uitbetalingen',
                    description: 'vouchers.tooltips.has_payouts',
                },
            },
            {
                key: 'state',
                label: 'vouchers.labels.state',
                tooltip: { key: 'state', title: 'Status', description: 'vouchers.tooltips.state' },
            },
        ];
    }
}

export default function useVoucherService(): VoucherService {
    return useState(new VoucherService())[0];
}
