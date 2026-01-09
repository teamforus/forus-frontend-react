import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Fund from '../props/models/Fund';
import FundProvider from '../props/models/FundProvider';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';
import FundTopUpTransaction from '../props/models/FundTopUpTransaction';
import SponsorIdentity, { SponsorIdentityCounts } from '../props/models/Sponsor/SponsorIdentity';
import Papa from 'papaparse';
import SponsorProduct from '../props/models/Sponsor/SponsorProduct';
import {
    FinancialOverview,
    ProviderFinancialStatistics,
} from '../components/pages/financial-dashboard/types/FinancialStatisticTypes';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { hasPermission } from '../helpers/utils';
import Organization, { Permission } from '../props/models/Organization';
import Product from '../props/models/Product';

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
    public prefix = '/platform/organizations';

    /**
     * Fetch a list
     */
    public list(
        company_id: number,
        data: object = {},
    ): Promise<ApiResponse<T, { unarchived_funds_total: number; archived_funds_total: number }>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/funds`, data);
    }

    public read(company_id: number, fund_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/funds/${fund_id}`, data);
    }

    public update(
        company_id: number,
        fund_id: number,
        data: Partial<T & { enable_physical_card_types?: number[]; disable_physical_card_types?: number[] }> = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${company_id}/funds/${fund_id}`, data);
    }

    public enablePhysicalCardType(
        company_id: number,
        fund_id: number,
        data: Partial<{
            physical_card_type_id: number;
            allow_physical_card_linking: boolean;
            allow_physical_card_requests: boolean;
            allow_physical_card_deactivation: boolean;
        }> = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${company_id}/funds/${fund_id}/enable-physical-card-type`, data);
    }

    public disablePhysicalCardType(
        company_id: number,
        fund_id: number,
        data: Partial<{ physical_card_type_id: number }> = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${company_id}/funds/${fund_id}/disable-physical-card-type`, data);
    }

    public store(company_id: number, data: object = {}): Promise<null> {
        return this.apiRequest.post(`${this.prefix}/${company_id}/funds`, data);
    }

    /**
     * Backoffice update
     */
    public backofficeUpdate(company_id: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${company_id}/funds/${id}/backoffice`, data);
    }

    /**
     * Backoffice test
     */
    public backofficeTest(
        company_id: number,
        id: number,
    ): Promise<ResponseSimple<{ state: string; response_code: number }>> {
        return this.apiRequest.post(`${this.prefix}/${company_id}/funds/${id}/backoffice-test`);
    }

    public readFinances(company_id: number, data: object = {}): Promise<ResponseSimple<ProviderFinancialStatistics>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/sponsor/finances`, data);
    }

    public financialOverview(company_id: number, data: object = {}): Promise<ResponseSimple<FinancialOverview>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/sponsor/finances-overview`, data);
    }

    public financialOverviewExportFields(
        organization_id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/finances-overview/export-fields`, data);
    }

    public financialOverviewExport(company_id: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/sponsor/finances-overview-export`, data, {
            responseType: 'arraybuffer',
        });
    }

    public destroy(company_id: number, fund_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${company_id}/funds/${fund_id}`);
    }

    public listTopUpTransactions(
        company_id: number,
        fund_id: number,
        data: object = {},
    ): Promise<ApiResponse<FundTopUpTransaction>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/funds/${fund_id}/top-up-transactions`, data);
    }

    public listIdentities(
        company_id: number,
        fund_id: number,
        data: object = {},
    ): Promise<ApiResponse<SponsorIdentity, { counts: SponsorIdentityCounts }>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/funds/${fund_id}/identities`, data);
    }

    public archive(company_id: number, fund_id: number): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${company_id}/funds/${fund_id}/archive`);
    }

    public unarchive(company_id: number, fund_id: number): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${company_id}/funds/${fund_id}/unarchive`);
    }

    public criterionValidate(company_id: number, fund_id: number, criteria: Array<object>): Promise<Array<unknown>> {
        const path = fund_id
            ? `${this.prefix}/${company_id}/funds/${fund_id}/criteria/validate`
            : `${this.prefix}/${company_id}/funds/criteria/validate`;

        return fund_id ? this.apiRequest.patch(path, { criteria }) : this.apiRequest.post(path, { criteria });
    }

    public updateCriteria(company_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${company_id}/funds/${id}/criteria`, { criteria: data });
    }

    /**
     * Send notification
     */
    public sendNotification(company_id: number, fund_id: number, data: object = {}): Promise<null> {
        return this.apiRequest.post<null>(
            `${this.prefix}/${company_id}/funds/${fund_id}/identities/notification`,
            data,
        );
    }

    /**
     * Export identities
     */
    public exportIdentities(
        company_id: number,
        fund_id: number,
        data: object = {},
    ): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get<null>(`${this.prefix}/${company_id}/funds/${fund_id}/identities/export`, data, {
            responseType: 'arraybuffer',
        });
    }

    /**
     * Get export identity fields
     */
    public exportIdentityFields(
        company_id: number,
        fund_id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get<null>(
            `${this.prefix}/${company_id}/funds/${fund_id}/identities/export-fields`,
            data,
        );
    }

    public readPublic(fund_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`/platform/funds/${fund_id}`, data);
    }

    public listProviderProducts(
        organization_id: number,
        fund_id: number,
        provider_id: number,
        query: object = {},
    ): Promise<ApiResponse<SponsorProduct>> {
        return this.apiRequest.get(
            `${this.prefix}/${organization_id}/funds/${fund_id}/providers/${provider_id}/products`,
            query,
        );
    }

    public getProviderProduct(
        organization_id: number,
        fund_id: number,
        provider_id: number,
        product_id: number,
        query: object = {},
    ): Promise<ApiResponseSingle<SponsorProduct>> {
        return this.apiRequest.get(
            `${this.prefix}/${organization_id}/funds/${fund_id}/providers/${provider_id}/products/${product_id}`,
            query,
        );
    }

    public readProvider(
        organization_id: number,
        fund_id: number,
        id: number,
    ): Promise<ApiResponseSingle<FundProvider>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/funds/${fund_id}/providers/${id}`);
    }

    public updateProvider(
        organization_id: number,
        fund_id: number,
        id: number,
        query: object = {},
    ): Promise<ApiResponseSingle<FundProvider>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/funds/${fund_id}/providers/${id}`, query);
    }

    public sampleCSV(fund: Fund): string {
        return Papa.unparse([fund.csv_required_keys.filter((key) => !key.endsWith('_eligible'))]);
    }

    public sampleCSVForPrevalidationRequest(fund: Fund): string {
        return Papa.unparse([
            ['bsn', ...fund.csv_required_keys_except_prefill.filter((key) => !key.endsWith('_eligible'))],
        ]);
    }

    public topUp(company_id: number, fund_id: number): Promise<ApiResponseSingle<FundTopUpTransaction>> {
        return this.apiRequest.post(`${this.prefix}/${company_id}/funds/${fund_id}/top-up`);
    }

    public export(company_id: number, fund_id: number, data: object = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/funds/${fund_id}/identities/export`, data, {
            responseType: 'arraybuffer',
        });
    }

    public exportFields(
        company_id: number,
        fund_id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/funds/${fund_id}/identities/export-fields`, data);
    }

    public getStates(): Array<{ value: string; name: string }> {
        return [
            { name: 'Waiting', value: 'waiting' },
            { name: 'Actief', value: 'active' },
            { name: 'Gepauzeerd', value: 'paused' },
            { name: 'Gesloten', value: 'closed' },
        ];
    }

    public getColumns(organization: Organization, funds_type: string): Array<ConfigurableTableColumn> {
        const list = [
            'name',
            'implementation',
            funds_type == 'active' && hasPermission(organization, Permission.VIEW_FINANCES) ? 'remaining' : null,
            funds_type == 'active' ? 'requester_count' : null,
            'status',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.organization_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.organization_funds.labels.${key}`,
                description: `components.organization_funds.tooltips.${key}`,
            },
        }));
    }

    public getProviderProductColumns(
        fund: Fund,
        product?: Product | SponsorProduct,
        history?: boolean,
    ): Array<ConfigurableTableColumn> {
        const isInformational = product?.price_type === 'informational';

        const list = [
            history ? 'used' : null,
            history ? 'reserved' : null,
            history ? 'price' : null,
            history ? null : 'product_details',
            fund?.show_subsidies && !isInformational ? 'acceptance' : null,
            fund?.show_subsidies && !isInformational ? 'user_price' : null,
            fund?.show_requester_limits && !isInformational ? 'limit_total' : null,
            fund?.show_requester_limits && !isInformational ? 'limit_per_user' : null,
            history ? null : 'messages',
            'status',
            'expiry_date',
            history ? 'created_on' : null,
            history ? 'updated_on' : null,
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.fund_provider_products.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.fund_provider_products.labels.${key}`,
                description: `components.fund_provider_products.tooltips.${key}`,
            },
        }));
    }

    public getProviderFundColumns(): Array<ConfigurableTableColumn> {
        const list = ['fund_name', 'status', 'budget', 'products', 'hide_on_webshops'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.fund_provider_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.fund_provider_funds.labels.${key}`,
                description: `components.fund_provider_funds.tooltips.${key}`,
            },
        }));
    }

    public getColumnsProductFunds(): Array<ConfigurableTableColumn> {
        const list = ['name', 'implementation', 'status'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.organization_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.organization_funds.labels.${key}`,
                description: `components.organization_funds.tooltips.${key}`,
            },
        }));
    }

    public getColumnsBalance(): Array<ConfigurableTableColumn> {
        const list = ['fund_name', 'total_budget', 'used_budget', 'current_budget', 'transaction_costs'].filter(
            (item) => item,
        );

        return list.map((key) => ({
            key,
            label: `financial_dashboard_overview.labels.${key}`,
            tooltip: {
                key: key,
                title: `financial_dashboard_overview.labels.${key}`,
                description: `financial_dashboard_overview.tooltips.${key}`,
            },
        }));
    }

    public getColumnsBudget(): Array<ConfigurableTableColumn> {
        const list = ['fund_name', 'total', 'active', 'inactive', 'deactivated', 'used', 'left'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `financial_dashboard_overview.labels.${key}`,
            tooltip: {
                key: key,
                title: `financial_dashboard_overview.labels.${key}`,
                description: `financial_dashboard_overview.tooltips.${key}`,
            },
        }));
    }

    public getFormulasColumns(): Array<ConfigurableTableColumn> {
        const list = ['id', 'type', 'amount', 'record_type', 'created_at', 'updated_at'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `fund_formulas.labels.${key}`,
            tooltip: {
                key: key,
                title: `fund_formulas.labels.${key}`,
                description: `fund_formulas.tooltips.${key}`,
            },
        }));
    }

    public getTopUpColumns(): Array<ConfigurableTableColumn> {
        const list = ['code', 'iban', 'amount', 'created_at'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `funds_show.top_up_table.labels.${key}`,
            tooltip: {
                key: key,
                title: `funds_show.top_up_table.labels.${key}`,
                description: `funds_show.top_up_table.tooltips.${key}`,
            },
        }));
    }

    public getImplementationsColumns(): Array<ConfigurableTableColumn> {
        const list = ['image', 'name', 'status'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `fund_implementations.labels.${key}`,
            tooltip: {
                key: key,
                title: `fund_implementations.labels.${key}`,
                description: `fund_implementations.tooltips.${key}`,
            },
        }));
    }

    public getIdentitiesColumns(): Array<ConfigurableTableColumn> {
        const list = [
            'id',
            'email',
            'count_vouchers',
            'count_vouchers_active',
            'count_vouchers_active_with_balance',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `fund_identities.labels.${key}`,
            tooltip: {
                key: key,
                title: `fund_identities.labels.${key}`,
                description: `fund_identities.tooltips.${key}`,
            },
        }));
    }

    public getProductHistoryColumns(): Array<ConfigurableTableColumn> {
        const list = ['updated_fields', 'date'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `sponsor_products.labels.${key}`,
            tooltip: {
                key: key,
                title: `sponsor_products.labels.${key}`,
                description: `sponsor_products.tooltips.${key}`,
            },
        }));
    }

    public getProviderOfficeColumns(): Array<ConfigurableTableColumn> {
        const list = ['address', 'phone'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.fund_provider_offices.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.fund_provider_offices.labels.${key}`,
                description: `components.fund_provider_offices.tooltips.${key}`,
            },
        }));
    }

    public getProviderEmployeeColumns(): Array<ConfigurableTableColumn> {
        const list = ['email'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `components.fund_provider_employees.labels.${key}`,
            tooltip: {
                key: key,
                title: `components.fund_provider_employees.labels.${key}`,
                description: `components.fund_provider_employees.tooltips.${key}`,
            },
        }));
    }
}

export function useFundService(): FundService {
    return useState(new FundService())[0];
}
