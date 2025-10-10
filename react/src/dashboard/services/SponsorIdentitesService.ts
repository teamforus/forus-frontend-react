import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import SponsorIdentity, { ProfileBankAccount } from '../props/models/Sponsor/SponsorIdentity';
import { ExportFieldProp } from '../components/modals/ModalExportDataSelect';
import Organization from '../props/models/Organization';
import IdentitiesApiPerson from '../props/models/IdentitiesApiPerson';
import SponsorProfileRelation from '../props/models/Sponsor/SponsorProfileRelation';
import Note from '../props/models/Note';

export class SponsorIdentitiesService<T = SponsorIdentity, B = ProfileBankAccount, R = SponsorProfileRelation> {
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

    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/identities`, data);
    }

    public list(organizationId: number, query: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/identities`, query);
    }

    public read(organizationId: number, identityId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/identities/${identityId}`);
    }

    public update(organizationId: number, identityId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/identities/${identityId}`, data);
    }

    public storeBankAccount(organizationId: number, identityId: number, data: object): Promise<ApiResponseSingle<B>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/identities/${identityId}/bank-accounts`,
            data,
        );
    }

    public updateBankAccount(
        organizationId: number,
        identityId: number,
        id: number,
        data: object,
    ): Promise<ApiResponseSingle<B>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/sponsor/identities/${identityId}/bank-accounts/${id}`,
            data,
        );
    }

    public deleteBankAccount(organizationId: number, identityId: number, id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(
            `${this.prefix}/${organizationId}/sponsor/identities/${identityId}/bank-accounts/${id}`,
        );
    }

    public getBankAccountColumns(): Array<ConfigurableTableColumn> {
        const list = ['iban', 'iban_name', 'updated_at', 'created_by'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `identities.bank_accounts.labels.${key}`,
            tooltip: {
                key: key,
                title: `identities.bank_accounts.labels.${key}`,
                description: `identities.bank_accounts.tooltips.${key}`,
            },
        }));
    }

    public getPersonBsn(
        organizationId: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<IdentitiesApiPerson>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/identities/${id}/person`, data);
    }

    /**
     * List relations
     * @param organizationId
     * @param identityId
     * @param query
     */
    public listRelations(organizationId: number, identityId: number, query: object = {}): Promise<ApiResponse<R>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/sponsor/identities/${identityId}/relations`,
            query,
        );
    }

    /**
     * Store relation
     * @param organizationId
     * @param identityId
     * @param data
     */
    public storeRelation(organizationId: number, identityId: number, data: object): Promise<ApiResponseSingle<R>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/identities/${identityId}/relations`,
            data,
        );
    }

    /**
     * Update relation
     * @param organizationId
     * @param identityId
     * @param id
     * @param data
     */
    public updateRelation(
        organizationId: number,
        identityId: number,
        id: number,
        data: object,
    ): Promise<ApiResponseSingle<R>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/sponsor/identities/${identityId}/relations/${id}`,
            data,
        );
    }

    /**
     * Delete relation
     * @param organizationId
     * @param identityId
     * @param id
     */
    public deleteRelation(organizationId: number, identityId: number, id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(
            `${this.prefix}/${organizationId}/sponsor/identities/${identityId}/relations/${id}`,
        );
    }

    public export(organization_id: number, filters = {}): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/identities/export`, filters, {
            responseType: 'arraybuffer',
        });
    }

    public exportFields(organization_id: number): Promise<ApiResponseSingle<Array<ExportFieldProp>>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/identities/export-fields`);
    }

    public notes(organizationId: number, id: number, data: object): Promise<ApiResponse<Note>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/identities/${id}/notes`, data);
    }

    public noteDestroy(organizationId: number, id: number, note_id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/sponsor/identities/${id}/notes/${note_id}`);
    }

    public storeNote(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<Note>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/identities/${id}/notes`, data);
    }

    public getColumns(organization: Organization): Array<ConfigurableTableColumn> {
        const list = [
            'id',
            'type',
            'given_name',
            'family_name',
            'email',
            organization.bsn_enabled ? 'bsn' : null,
            'client_number',
            'birth_date',
            'last_login',
            'last_activity',
            'city',
            'street',
            'house_number',
            'house_number_addition',
            'postal_code',
            'municipality_name',
            'neighborhood_name',
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `identities.labels.${key}`,
            tooltip: {
                key: key,
                title: `identities.labels.${key}`,
                description: `identities.tooltips.${key}`,
            },
        }));
    }

    public getColumnsRelations(organization: Organization): Array<ConfigurableTableColumn> {
        const list = [
            'id',
            'relation_type',
            'relation_subtype',
            'relation_living_together',
            'given_name',
            'family_name',
            'email',
            organization.bsn_enabled ? 'bsn' : null,
        ].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `identities.labels.${key}`,
            tooltip: {
                key: key,
                title: `identities.labels.${key}`,
                description: `identities.tooltips.${key}`,
            },
        }));
    }
}

export default function useSponsorIdentitiesService(): SponsorIdentitiesService {
    return useState(new SponsorIdentitiesService())[0];
}
