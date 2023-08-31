import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Organization from '../props/models/Organization';
import { hasPermission } from '../helpers/utils';
import ExternalFund from '../props/models/ExternalFund';

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

    public updateReservationFields(id: number, data = {}) {
        return this.apiRequest.patch(`${this.prefix}/${id}/update-reservation-fields`, data) as Promise<
            ApiResponseSingle<T>
        >;
    }

    public updateAcceptReservations(id: number, auto_accept: boolean) {
        return this.apiRequest.patch(`${this.prefix}/${id}/accept-reservations`, {
            reservations_auto_accept: auto_accept,
        });
    }

    public updateBusinessType(id: number, business_type_id: number) {
        return this.apiRequest.patch(`${this.prefix}/${id}/update-business`, {
            business_type_id: business_type_id,
        });
    }

    public transferOwnership(id: number, data = {}) {
        return this.apiRequest.patch(`${this.prefix}/${id}/transfer-ownership`, data);
    }

    public listValidatorsAvailable(data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, {
            ...data,
            is_employee: 0,
            is_validator: 1,
        }) as Promise<ApiResponse<T>>;
    }

    public readListValidators(id: number, data: object = {}) {
        return this.apiRequest.get(`${this.prefix}/${id}/validators`, data);
    }

    public addExternalValidator(id: number, validator_organization_id: number, data = {}) {
        return this.apiRequest.post(`${this.prefix}/${id}/validators`, {
            ...data,
            organization_id: validator_organization_id,
        });
    }

    public removeExternalValidator(id: number, validator_organization_id: number, data = {}) {
        return this.apiRequest._delete(`${this.prefix}/${id}/validators`, {
            ...data,
            organization_id: validator_organization_id,
        });
    }

    public listProviders(id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}/providers`, data) as Promise<ApiResponse<T>>;
    }

    public listProvidersExport(id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}/providers/export`, data) as Promise<ApiResponse<T>>;
    }

    public listExternalFunds(id: number, data: object = {}): Promise<ApiResponse<ExternalFund>> {
        return this.apiRequest.get(`${this.prefix}/${id}/external-funds`, data);
    }

    public externalFundUpdate(id: number, fund_id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.patch(`${this.prefix}/${id}/external-funds/${fund_id}`, data) as Promise<ApiResponse<T>>;
    }

    public providerOrganizations(id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers`, data) as Promise<ApiResponse<T>>;
    }

    public providerOrganization(id: number, provider_organization_id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}`,
            data,
        ) as Promise<ApiResponse<T>>;
    }

    public providerOrganizationsExport(id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/export`, data) as Promise<ApiResponse<T>>;
    }

    public financeProviders(id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/finances`, data) as Promise<ApiResponse<T>>;
    }

    public financeProvidersExport(id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}/sponsor/providers/finances-export`, data) as Promise<
            ApiResponse<T>
        >;
    }

    public sponsorProducts(id: number, provider_organization_id: number, data = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products`,
            data,
        ) as Promise<ApiResponse<T>>;
    }

    public sponsorProduct(id: number, provider_organization_id: number, product_id: number): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products/${product_id}`,
        ) as Promise<ApiResponse<T>>;
    }

    public sponsorProductUpdate(
        id: number,
        provider_organization_id: number,
        product_id: number,
        data = {},
    ): Promise<ApiResponse<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products/${product_id}`,
            data,
        ) as Promise<ApiResponse<T>>;
    }

    public sponsorProductDelete(
        id: number,
        provider_organization_id: number,
        product_id: number,
    ): Promise<ApiResponse<T>> {
        return this.apiRequest._delete(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products/${product_id}`,
        ) as Promise<ApiResponse<T>>;
    }

    public sponsorStoreProduct(id: number, provider_organization_id: number, data = {}) {
        return this.apiRequest.post(
            `${this.prefix}/${id}/sponsor/providers/${provider_organization_id}/products`,
            data,
        );
    }

    public getRoutePermissionsMap(type = 'sponsor') {
        return {
            sponsor: [
                {
                    permissions: ['manage_funds', 'view_finances', 'view_funds'],
                    name: 'organization-funds',
                },
                {
                    permissions: ['manage_vouchers'],
                    name: 'vouchers',
                },
                {
                    permissions: ['view_finances'],
                    name: 'transactions',
                },
                {
                    permissions: ['validate_records'],
                    name: 'csv-validation',
                },
            ],
            provider: [
                {
                    permissions: ['manage_employees'],
                    name: 'provider-overview',
                },
                {
                    permissions: ['manage_offices'],
                    name: 'offices',
                },
                {
                    permissions: ['manage_products'],
                    name: 'products',
                },
                {
                    permissions: ['view_finances'],
                    name: 'transactions',
                },
                {
                    permissions: ['validate_records'],
                    name: 'csv-validation',
                },
                {
                    permissions: ['scan_vouchers'],
                    name: 'reservations',
                },
            ],
            validator: [
                {
                    permissions: ['validate_records', 'manage_validators'],
                    name: 'fund-requests',
                },
            ],
        }[type];
    }

    getAvailableRoutes = (type: string, organization: Organization) => {
        return this.getRoutePermissionsMap(type).filter((permission) => {
            return hasPermission(organization, permission.permissions, false);
        });
    };
}

export function useOrganizationService(): OrganizationService {
    const [service] = useState(new OrganizationService());

    return service;
}
