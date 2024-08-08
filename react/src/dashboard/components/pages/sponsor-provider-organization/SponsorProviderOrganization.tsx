import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useFilter from '../../../hooks/useFilter';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import { useParams } from 'react-router-dom';
import usePushDanger from '../../../hooks/usePushDanger';
import useSetProgress from '../../../hooks/useSetProgress';
import { useOrganizationService } from '../../../services/OrganizationService';
import FundProvider from '../../../props/models/FundProvider';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Paginator from '../../../modules/paginator/components/Paginator';
import FundProviderTableItem from './elements/FundProviderTableItem';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import ProviderOrganizationOverview from './elements/ProviderOrganizationOverview';
import type { SponsorProviderOrganization } from '../../../props/models/Organization';
import { strLimit } from '../../../helpers/string';
import useTranslate from '../../../hooks/useTranslate';
import EmptyCard from '../../elements/empty-card/EmptyCard';

export default function SponsorProviderOrganization() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const organizationService = useOrganizationService();

    const [fundProviders, setFundProviders] = useState<PaginationData<FundProvider>>(null);
    const [providerOrganization, setProviderOrganization] = useState<SponsorProviderOrganization>(null);

    const filter = useFilter({ q: '', per_page: 10 });

    const updateFundProviderInList = useCallback(
        (data: FundProvider, index: number) => {
            const list = { ...fundProviders };
            list.data[index] = data;
            setFundProviders(list);
        },
        [fundProviders],
    );

    const fetchFundProviders = useCallback(() => {
        setProgress(0);

        organizationService
            .listProviders(activeOrganization.id, { ...filter.activeValues, organization_id: id })
            .then((res) => setFundProviders(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, organizationService, activeOrganization.id, filter.activeValues, id, pushDanger]);

    const fetchProviderOrganization = useCallback(() => {
        setProgress(0);

        organizationService
            .providerOrganization(activeOrganization.id, parseInt(id))
            .then((res) => setProviderOrganization(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, id, organizationService, pushDanger, setProgress]);

    useEffect(() => {
        fetchFundProviders();
    }, [fetchFundProviders]);

    useEffect(() => {
        fetchProviderOrganization();
    }, [fetchProviderOrganization]);

    if (!providerOrganization || !fundProviders) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'sponsor-provider-organizations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('page_state_titles.organization-providers')}
                </StateNavLink>
                <div className="breadcrumb-item active">{providerOrganization.name}</div>
            </div>

            <ProviderOrganizationOverview organization={providerOrganization} />

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-col">
                            <div className="card-title">Fondsen en aanbod</div>
                        </div>
                        <div className="flex-col">
                            <div className="card-header-drown">
                                <div className="block block-inline-filters">
                                    <div className="form">
                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                value={filter.values.q}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                                placeholder="Zoeken"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-padless">
                    <div className="table-wrapper">
                        <table className="table form">
                            <tbody>
                                <tr>
                                    <th className="td-narrow">Afbeelding</th>
                                    <th>Fondsnaam</th>
                                    <th>Status</th>
                                    <th>Budget scannen</th>
                                    <th>Aanbod scannen</th>
                                    <th>Verborgen op webshop</th>
                                    <th className="text-right">Opties</th>
                                </tr>
                                {fundProviders.data.map((fundProvider, index) => (
                                    <FundProviderTableItem
                                        key={fundProvider.id}
                                        fundProvider={fundProvider}
                                        organization={activeOrganization}
                                        onChange={(data) => updateFundProviderInList(data, index)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {fundProviders.meta.total == 0 && <EmptyCard type={'card-section'} title={'Geen aanmeldingen'} />}

                {fundProviders.meta && (
                    <div className="card-section card-section-narrow">
                        <Paginator meta={fundProviders.meta} filters={filter.values} updateFilters={filter.update} />
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Omschrijving van aanbieder</div>
                </div>
                <div className="card-section">
                    <div className="block block-markdown">
                        {providerOrganization.description_html ? (
                            <div
                                className="markdown-wrapper"
                                dangerouslySetInnerHTML={{ __html: providerOrganization.description_html }}
                            />
                        ) : (
                            <div className="markdown-wrapper">
                                <p className="text-muted-dark">Er is geen omschrijving opgegeven door de aanbieder.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Vestigingen</div>
                </div>

                {providerOrganization.offices.length > 0 ? (
                    <div className="card-section card-section-padless">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th>Adres</th>
                                        <th className="text-right">Telefoonnummer</th>
                                    </tr>

                                    {providerOrganization.offices.map((office) => (
                                        <tr key={office.id}>
                                            <td className={!office.address ? 'text-muted' : ''}>
                                                {office.address || 'n.v.t.'}
                                            </td>
                                            <td className={`text-right ${!office.phone ? 'text-muted' : ''}`}>
                                                {office.phone || 'n.v.t.'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <EmptyCard type={'card-section'} title={'Geen vestigingen'} />
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Medewerkers</div>
                </div>

                {providerOrganization.employees.length > 0 ? (
                    <div className="card-section card-section-padless">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th>E-Mailadres</th>
                                    </tr>

                                    {providerOrganization.employees.map((employee) => (
                                        <tr key={employee.id}>
                                            {employee.email ? (
                                                <td>{employee.email}</td>
                                            ) : (
                                                <td>{strLimit(employee.identity_address, 32)}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <EmptyCard type={'card-section'} title={'Geen medewerkers'} />
                )}
            </div>
        </Fragment>
    );
}
