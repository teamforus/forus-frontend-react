import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Organization, { SponsorProviderOrganization, TranslationStats } from '../props/models/Organization';
import { hasPermission } from '../helpers/utils';
import OrganizationFeatureStatuses from './types/OrganizationFeatureStatuses';
import FundProvider from '../props/models/FundProvider';
import { ProviderFinancial } from '../components/pages/financial-dashboard/types/FinancialStatisticTypes';
import SponsorProduct from '../props/models/Sponsor/SponsorProduct';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';

export class OrganizationService<T = Organization> {
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

    public list(data = {}) {
        return this.apiRequest.get<ApiResponse<T>>(`${this.prefix}`, data);
    }

    public store(data = {}) {
        return this.apiRequest.post<ApiResponseSingle<T>>(`${this.prefix}`, this.apiFormToResource(data));
    }

    public update(id: number, data = {}) {
        return this.apiRequest.patch<ApiResponseSingle<T>>(`${this.prefix}/${id}`, this.apiFormToResource(data));
    }

    public read(id: number, data = {}) {
        return this.apiRequest.get<ApiResponseSingle<T>>(`${this.prefix}/${id}`, data);
    }

    public updateRole(id: number, data = {}) {
        return this.apiRequest.patch<ApiResponseSingle<T>>(`${this.prefix}/${id}/roles`, data);
    }

    public updateBankFields(id: number, data = {}) {
        return this.apiRequest.patch<ApiResponseSingle<T>>(`${this.prefix}/${id}/bank-fields`, data);
    }

    public use(id?: number): void {
        localStorage.setItem('active_organization', id?.toString());
    }

    public active(): number | null {
        const id = parseInt(localStorage.getItem('active_organization') || null);

        return isNaN(id) ? null : id;
    }

    public apiFormToResource(formData: object): object {
        const values = JSON.parse(JSON.stringify(formData));

        if (['http:' + '//', 'https://'].indexOf(values.website) != -1) {
            values.website = '';
        }

        return values;
    }

    public apiResourceToForm(apiResource: Organization): object {
        return {
            business_type_id: apiResource.business_type_id,
            name: apiResource.name,
            description: apiResource.description,
            description_html: apiResource.description_html,
            iban: apiResource.iban,
            email: apiResource.email,
            email_public: !!apiResource.email_public,
            phone: apiResource.phone,
            phone_public: !!apiResource.phone_public,
            kvk: apiResource.kvk,
            btw: apiResource.btw,
            website: apiResource.website || 'https://',
            website_public: !!apiResource.website_public,
        };
    }

    public updateReservationFields(id: number, data = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${id}/update-reservation-fields`, data);
    }

    public updateAcceptReservations(id: number, auto_accept: boolean): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${id}/update-accept-reservations`, {
            reservations_auto_accept: auto_accept,
        });
    }

    public transferOwnership(id: number, data = {}) {
        return this.apiRequest.patch(`${this.prefix}/${id}/transfer-ownership`, data);
    }

    public listProviders(id: number, data = {}): Promise<ApiResponse<FundProvider>> {
        return this.apiRequest.get(`${this.prefix}/${id}/providers`, data);
    }

    public providerOrganizations(id: number, data = {}): Promise<ApiResponse<SponsorProviderOrganization>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers`, data);
    }

    public translationStats(
        id: number,
        data = {},
    ): Promise<ResponseSimple<{ data: TranslationStats; current_month: TranslationStats }>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/translation-stats`, data);
    }

    public providerOrganization(
        id: number,
        provider_organization_id: number,
        data = {},
    ): Promise<ApiResponseSingle<SponsorProviderOrganization>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/${provider_organization_id}`, data);
    }

    public providerExportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/providers/export-fields`);
    }

    public providerOrganizationsExport(id: number, data = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/export`, data, {
            responseType: 'arraybuffer',
        });
    }

    public financeProviders(id: number, data = {}): Promise<ApiResponse<ProviderFinancial>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/finances`, data);
    }

    public financeProvidersExportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/providers/finances-export-fields`);
    }

    public financeProvidersExport(id: number, data = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/finances-export`, data, {
            responseType: 'arraybuffer',
        });
    }

    public sponsorProducts(
        id: number,
        provider_organization_id: number,
        data = {},
    ): Promise<ApiResponse<SponsorProduct>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products`, data);
    }

    public sponsorProductUpdate(
        id: number,
        provider_organization_id: number,
        product_id: number,
        data = {},
    ): Promise<ApiResponseSingle<SponsorProduct>> {
        return this.apiRequest.patch(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products/${product_id}`,
            data,
        );
    }

    public sponsorProductDelete(
        id: number,
        provider_organization_id: number,
        product_id: number,
    ): Promise<ApiResponse<T>> {
        return this.apiRequest.delete(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products/${product_id}`,
        );
    }

    public sponsorStoreProduct(
        id: number,
        provider_organization_id: number,
        data = {},
    ): Promise<ApiResponseSingle<SponsorProduct>> {
        return this.apiRequest.post(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products`,
            data,
        );
    }

    public getFeatures(id: number): Promise<ApiResponseSingle<OrganizationFeatureStatuses>> {
        return this.apiRequest.get(`${this.prefix}/${id}/features`);
    }

    public getRoutePermissionsMap(type = 'sponsor') {
        return {
            sponsor: [
                { permissions: ['manage_funds', 'view_finances', 'view_funds'], name: 'organization-funds' },
                { permissions: ['manage_vouchers', 'view_vouchers'], name: 'vouchers' },
                { permissions: ['view_finances'], name: 'transactions' },
                { permissions: ['manage_payouts'], name: 'payouts' },
                { permissions: ['validate_records'], name: 'csv-validation' },
                { permissions: ['view_identities', 'manage_identities'], name: 'identities' },
            ],
            provider: [
                { permissions: ['manage_employees'], name: 'provider-overview' },
                { permissions: ['manage_offices'], name: 'offices' },
                { permissions: ['manage_products'], name: 'products' },
                { permissions: ['view_finances'], name: 'transactions' },
                { permissions: ['validate_records'], name: 'csv-validation' },
                { permissions: ['scan_vouchers'], name: 'reservations' },
            ],
            validator: [{ permissions: ['validate_records', 'manage_validators'], name: 'fund-requests' }],
        }[type];
    }

    public getAvailableRoutes = (type: string, organization: Organization) => {
        return this.getRoutePermissionsMap(type).filter((permission) => {
            return hasPermission(organization, permission.permissions, false);
        });
    };

    public getProviderColumns(): Array<ConfigurableTableColumn> {
        const list = ['organization_name', 'last_active', 'product_count', 'funds_count'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `provider_organizations.labels.${key}`,
            tooltip: {
                key: key,
                title: `provider_organizations.labels.${key}`,
                description: `provider_organizations.tooltips.${key}`,
            },
        }));
    }

    public getTranslationStatsColumns(): Array<ConfigurableTableColumn> {
        const list = ['type', 'used', 'cost'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `translation_stats.labels.${key}`,
            tooltip: {
                key: key,
                title: `translation_stats.labels.${key}`,
                description: `translation_stats.tooltips.${key}`,
            },
        }));
    }
}

export function useOrganizationService(): OrganizationService {
    return useState(new OrganizationService())[0];
}
