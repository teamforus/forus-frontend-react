import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { PaginationData } from '../../../props/ApiResponses';
import { useParams } from 'react-router';
import useSetProgress from '../../../hooks/useSetProgress';
import { useOrganizationService } from '../../../services/OrganizationService';
import FundProvider from '../../../props/models/FundProvider';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Paginator from '../../../modules/paginator/components/Paginator';
import FundProviderTableItem from './elements/FundProviderTableItem';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import ProviderOrganizationOverview from './elements/ProviderOrganizationOverview';
import type { SponsorProviderOrganization } from '../../../props/models/Organization';
import useTranslate from '../../../hooks/useTranslate';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import usePushApiError from '../../../hooks/usePushApiError';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import { useFundService } from '../../../services/FundService';
import SponsorProviderOffices from './elements/SponsorProviderOffices';
import SponsorProviderEmployees from './elements/SponsorProviderEmployees';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';

export default function SponsorProviderOrganization() {
    const { id } = useParams();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const organizationService = useOrganizationService();

    const [fundProviders, setFundProviders] = useState<PaginationData<FundProvider>>(null);
    const [providerOrganization, setProviderOrganization] = useState<SponsorProviderOrganization>(null);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            page: 1,
            per_page: 10,
        },
        {
            queryParams: {
                q: StringParam,
                page: NumberParam,
            },
        },
    );

    const tableRef = useRef<HTMLTableElement>(null);

    const { headElement, configsElement } = useConfigurableTable(fundService.getProviderFundColumns());

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
            .listProviders(activeOrganization.id, { ...filterValuesActive, organization_id: id })
            .then((res) => setFundProviders(res.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [setProgress, organizationService, activeOrganization.id, filterValuesActive, id, pushApiError]);

    const fetchProviderOrganization = useCallback(() => {
        setProgress(0);

        organizationService
            .providerOrganization(activeOrganization.id, parseInt(id))
            .then((res) => setProviderOrganization(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, id, organizationService, pushApiError, setProgress]);

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
                    name={DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATIONS}
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
                    <div className="flex flex-grow card-title">Fondsen en aanbod</div>

                    <div className="card-header-filters">
                        <div className="block block-inline-filters form">
                            <div className="form-group">
                                <input
                                    className="form-control"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder="Zoeken"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section card-section-padless">
                    {configsElement}

                    <TableTopScroller onScroll={() => tableRef.current?.click()}>
                        <table className="table form">
                            {headElement}

                            <tbody>
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
                    </TableTopScroller>
                </div>

                {fundProviders.meta.total == 0 && <EmptyCard type={'card-section'} title={'Geen aanmeldingen'} />}

                {fundProviders.meta && (
                    <div className="card-section card-section-narrow">
                        <Paginator meta={fundProviders.meta} filters={filterValues} updateFilters={filterUpdate} />
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

            <SponsorProviderOffices offices={providerOrganization.offices} />
            <SponsorProviderEmployees employees={providerOrganization.employees} />
        </Fragment>
    );
}
