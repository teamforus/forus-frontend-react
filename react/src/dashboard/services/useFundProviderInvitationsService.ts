import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundProviderInvitation from '../props/models/FundProviderInvitation';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class FundProviderInvitationsService<T = FundProviderInvitation> {
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
    public index(organization_id: number, fund_id: number, query: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/funds/${fund_id}/provider-invitations`, query);
    }

    public store(organization_id: number, fund_id: number, from_fund_id: number): Promise<ApiResponse<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/funds/${fund_id}/provider-invitations`, {
            fund_id: from_fund_id,
        });
    }

    public read(organization_id: number, fund_id: number, invitation_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organization_id}/funds/${fund_id}/provider-invitations/${invitation_id}`,
        );
    }

    public readInvitation(token: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`/platform/provider-invitations/${token}`);
    }

    public acceptInvitation(token: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`/platform/provider-invitations/${token}`);
    }

    public listInvitations = (organization_id: number, filters: object = {}): Promise<ApiResponse<T>> => {
        return this.apiRequest.get(`/platform/organizations/${organization_id}/provider-invitations`, filters);
    };

    public acceptInvitationById(organization_id: number, invitation_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `/platform/organizations/${organization_id}/provider-invitations/${invitation_id}`,
        );
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['name', 'organization_name', 'start_date', 'end_date', 'status'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `provider_funds.labels.${key}`,
            tooltip: {
                key: key,
                title: `provider_funds.labels.${key}`,
                description: `provider_funds.tooltips.${key}`,
            },
        }));
    }
}

export default function useFundProviderInvitationsService(): FundProviderInvitationsService {
    return useState(new FundProviderInvitationsService())[0];
}
