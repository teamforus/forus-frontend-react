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
    ProviderFinancialStatistics,
    FinancialOverview,
} from '../components/pages/financial-dashboard/types/FinancialStatisticTypes';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { hasPermission } from '../helpers/utils';
import Organization from '../props/models/Organization';

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
    public prefix_public = '/platform/funds';

    /**
     * Fetch list
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

    public update(company_id: number, fund_id: number, data: Partial<T> = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${company_id}/funds/${fund_id}`, data);
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

    public readIdentity(
        company_id: number,
        fund_id: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<SponsorIdentity>> {
        return this.apiRequest.get(`${this.prefix}/${company_id}/funds/${fund_id}/identities/${id}`, data);
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
            funds_type == 'active' && hasPermission(organization, 'view_finances') ? 'remaining' : null,
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
}

export function useFundService(): FundService {
    return useState(new FundService())[0];
}
