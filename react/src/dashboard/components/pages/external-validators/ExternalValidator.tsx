import React, { useCallback, useEffect, useState } from 'react';
import useFilter from '../../../hooks/useFilter';
import { strLimit } from '../../../helpers/string';
import Paginator from '../../../modules/paginator/components/Paginator';
import ModalDangerZone from '../../modals/ModalDangerZone';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import { useOrganizationService } from '../../../services/OrganizationService';
import Organization from '../../../props/models/Organization';
import ThSortable from '../../elements/tables/ThSortable';
import useAssetUrl from '../../../hooks/useAssetUrl';

type OrganizationLocal = Organization & { approved?: boolean };

export default function ExternalValidator() {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const activeOrganization = useActiveOrganization();

    const organizationService = useOrganizationService();
    const paginatorService = usePaginatorService();

    const [externalValidators, setExternalValidators] = useState<PaginationData<OrganizationLocal>>(null);
    const [approvedOrganizations, setApprovedOrganizations] = useState<Array<number>>(null);
    const [paginatorKey] = useState('external-validators');

    const filter = useFilter({
        q: '',
        order_by: 'name',
        order_dir: 'asc',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const mapValidators = useCallback(
        (data: PaginationData<Organization>) => ({
            ...data,
            data: data.data.map((organization) => ({
                ...organization,
                approved: approvedOrganizations.indexOf(organization.id) !== -1,
            })),
        }),
        [approvedOrganizations],
    );

    const fetchAvailableExternalValidators = useCallback(() => {
        organizationService
            .listValidatorsAvailable(filter.activeValues)
            .then((res) => setExternalValidators(mapValidators(res.data)))
            .catch((res: ResponseError) => pushDanger(res.data.message));
    }, [organizationService, filter.activeValues, mapValidators, pushDanger]);

    const fetchApprovedValidators = useCallback(() => {
        organizationService
            .readListValidators(activeOrganization.id, { per_page: 100 })
            .then((res) => setApprovedOrganizations(res.data.data.map((item) => item.validator_organization_id)))
            .catch((res: ResponseError) => pushDanger(res.data.message));
    }, [organizationService, activeOrganization.id, pushDanger]);

    const addExternalValidator = useCallback(
        (organization: OrganizationLocal) => {
            organizationService
                .addExternalValidator(activeOrganization.id, organization.id)
                .then(() => {
                    fetchApprovedValidators();
                    pushSuccess('Opgeslagen!');
                })
                .catch((res: ResponseError) => pushDanger(res.data.message));
        },
        [organizationService, activeOrganization.id, fetchApprovedValidators, pushSuccess, pushDanger],
    );

    const removeExternalValidator = useCallback(
        function (organization: OrganizationLocal) {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_external_validators.title')}
                    description={translate('modals.danger_zone.remove_external_validators.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_external_validators.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            organizationService
                                .removeExternalValidator(activeOrganization.id, organization.id)
                                .then(() => {
                                    fetchApprovedValidators();
                                    pushSuccess('Opgeslagen!');
                                    modal.close();
                                })
                                .catch((res: ResponseError) => pushDanger(res.data.message));
                        },
                        text: translate('modals.danger_zone.remove_external_validators.buttons.confirm'),
                    }}
                />
            ));
        },
        [
            openModal,
            translate,
            pushDanger,
            pushSuccess,
            organizationService,
            activeOrganization.id,
            fetchApprovedValidators,
        ],
    );

    useEffect(() => {
        if (approvedOrganizations) {
            fetchAvailableExternalValidators();
        }
    }, [approvedOrganizations, fetchAvailableExternalValidators]);

    useEffect(() => fetchApprovedValidators(), [fetchApprovedValidators]);

    if (!externalValidators) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">Beoordelaars ({externalValidators?.meta.total})</div>
                    </div>

                    <div className="flex">
                        <div className="block block-inline-filters">
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={filter.values.q}
                                        placeholder="Zoeken"
                                        className="form-control"
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {externalValidators?.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <ThSortable
                                            label={translate('external_validators.labels.organization_name')}
                                            value={'name'}
                                            filter={filter}
                                        />
                                        <ThSortable
                                            label={translate('external_validators.labels.email')}
                                            value={'email'}
                                            filter={filter}
                                        />
                                        <ThSortable
                                            label={translate('external_validators.labels.phone')}
                                            value={'phone'}
                                            filter={filter}
                                        />
                                        <ThSortable
                                            label={translate('external_validators.labels.website')}
                                            value={'website'}
                                            filter={filter}
                                        />
                                        <th className={'text-right'}>
                                            {translate('external_validators.labels.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {externalValidators?.data.map((organization: OrganizationLocal) => (
                                        <tr key={organization.id}>
                                            <td>
                                                <div className="td-collapsable">
                                                    <div className="collapsable-media">
                                                        <img
                                                            className="td-media td-media-sm"
                                                            src={
                                                                organization.logo?.sizes.thumbnail ||
                                                                assetUrl(
                                                                    '/assets/img/placeholders/organization-thumbnail.png',
                                                                )
                                                            }
                                                            alt={organization.name}
                                                        />
                                                    </div>

                                                    <div className="collapsable-content">
                                                        <div className="text-primary text-strong">
                                                            {strLimit(organization.name, 40)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td
                                                className={`${
                                                    organization.email ? 'text-medium text-primary-light' : 'text-muted'
                                                }`}>
                                                {organization.email || '-'}
                                            </td>
                                            <td className={`${organization.phone ? '' : 'text-muted'}`}>
                                                {organization.phone || '-'}
                                            </td>
                                            <td
                                                className={`${
                                                    organization.website
                                                        ? 'text-medium text-primary-light'
                                                        : 'text-muted'
                                                }`}>
                                                {organization.website || '-'}
                                            </td>

                                            <td className="text-right">
                                                {organization.approved ? (
                                                    <button
                                                        type={'button'}
                                                        className="button button-default button-sm"
                                                        onClick={() => removeExternalValidator(organization)}>
                                                        <em className="mdi mdi-close icon-start"></em>
                                                        {translate('external_validators.buttons.delete')}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type={'button'}
                                                        className="button button-primary button-sm"
                                                        onClick={() => addExternalValidator(organization)}>
                                                        <em className="mdi mdi-check-circle icon-start"></em>
                                                        {translate('external_validators.buttons.add')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {externalValidators?.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen beoordelaars beschikbaar.</div>
                    </div>
                </div>
            )}

            {externalValidators?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={externalValidators.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
