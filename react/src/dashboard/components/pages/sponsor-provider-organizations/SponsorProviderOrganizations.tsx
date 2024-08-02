import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useFileService } from '../../../services/FileService';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../elements/select-control/SelectControl';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import { useOrganizationService } from '../../../services/OrganizationService';
import useFundUnsubscribeService from '../../../services/FundUnsubscribeService';
import { SponsorProviderOrganization } from '../../../props/models/Organization';
import ModalExportTypeLegacy from '../../modals/ModalExportTypeLegacy';
import { format } from 'date-fns';
import useSetProgress from '../../../hooks/useSetProgress';
import { NumberParam, StringParam, createEnumParam } from 'use-query-params';
import useTranslate from '../../../hooks/useTranslate';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import ThSortable from '../../elements/tables/ThSortable';
import ProvidersTableItem from './elements/ProvidersTableItem';
import Paginator from '../../../modules/paginator/components/Paginator';

export default function SponsorProviderOrganizations() {
    const translate = useTranslate();

    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fileService = useFileService();
    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const organizationService = useOrganizationService();
    const implementationService = useImplementationService();
    const fundUnsubscribeService = useFundUnsubscribeService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);
    const [providerOrganizations, setProviderOrganizations] =
        useState<PaginationData<SponsorProviderOrganization>>(null);
    const [requests, setRequests] = useState(null);
    const [paginatorKey] = useState('provider_organizations');
    const [requestsExpired, setRequestsExpired] = useState(null);
    const [requestsPending, setRequestsPending] = useState(null);

    const [orderByOptions] = useState([
        { value: 'application_date', name: 'Nieuwste eerst' },
        { value: 'name', name: 'Naam aflopend' },
    ]);

    const [filterValues, filterActiveValues, filterUpdate, filter] = useFilterNext<{
        q?: string;
        page?: number;
        fund_id?: number;
        per_page?: number;
        order_by?: string;
        allow_budget?: '0' | '1';
        has_products?: '0' | '1';
        allow_products?: '0' | '1' | '-1';
        implementation_id?: number;
        allow_extra_payments?: '0' | '1';
    }>(
        {
            q: '',
            page: 1,
            fund_id: null,
            order_by: orderByOptions[0].value,
            per_page: paginatorService.getPerPage(paginatorKey),
            allow_budget: null,
            has_products: null,
            allow_products: null,
            implementation_id: null,
            allow_extra_payments: null,
        },
        {
            queryParamsRemoveDefault: true,
            queryParams: {
                q: StringParam,
                page: NumberParam,
                per_page: NumberParam,
                order_by: StringParam,
                fund_id: NumberParam,
                allow_budget: createEnumParam(['0', '1']),
                has_products: createEnumParam(['0', '1']),
                allow_products: createEnumParam(['0', '1', '-1']),
                implementation_id: NumberParam,
                allow_extra_payments: createEnumParam(['0', '1']),
            },
        },
    );

    const fetchImplementations = useCallback(() => {
        setProgress(0);

        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties' }, ...res.data.data]))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, implementationService, pushDanger, setProgress]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setFunds([{ id: null, name: 'Alle fondsen' }, ...res.data.data]))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, pushDanger, setProgress]);

    const fetchProviderOrganizations = useCallback(() => {
        setLoading(true);
        setProgress(0);

        const query = {
            ...filterActiveValues,
            ...{
                order_dir: filterActiveValues.order_by == 'name' ? 'asc' : 'desc',
                allow_products: filterActiveValues.allow_products === '-1' ? 'some' : filterActiveValues.allow_products,
            },
        };

        organizationService
            .providerOrganizations(activeOrganization.id, query)
            .then((res) => setProviderOrganizations(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [activeOrganization.id, filterActiveValues, organizationService, pushDanger, setProgress]);

    const fetchFundUnsubscribes = useCallback(() => {
        setProgress(0);

        fundUnsubscribeService
            .listSponsor(activeOrganization.id, { per_page: 1000 })
            .then((res) => {
                setRequests(res.data.data.length);
                setRequestsExpired(res.data.data.filter((item) => item.state == 'overdue').length);
                setRequestsPending(res.data.data.filter((item) => item.state == 'pending').length);
            })
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundUnsubscribeService, pushDanger, setProgress]);

    const doExport = useCallback(
        (exportType: string) => {
            organizationService
                .providerOrganizationsExport(activeOrganization.id, { ...filterActiveValues, export_type: exportType })
                .then((res) => {
                    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    const fileName = `providers_${activeOrganization.id}_${dateTime}.${exportType}`;

                    fileService.downloadFile(fileName, res.data, res.headers['content-type']);
                })
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
        },
        [pushDanger, fileService, filterActiveValues, activeOrganization, organizationService],
    );

    const exportList = useCallback(() => {
        openModal((modal) => <ModalExportTypeLegacy modal={modal} onSubmit={doExport} />);
    }, [doExport, openModal]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    useEffect(() => {
        fetchFundUnsubscribes();
    }, [fetchFundUnsubscribes]);

    useEffect(() => {
        fetchProviderOrganizations();
    }, [fetchProviderOrganizations]);

    if (!funds || !implementations || !providerOrganizations) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card">
                {requests > 0 && (
                    <div
                        className={`card-block card-block-requests ${
                            requestsExpired > 0
                                ? 'card-block-requests-danger'
                                : requestsPending > 0
                                  ? 'card-block-requests-warning'
                                  : ''
                        }`}>
                        <StateNavLink
                            name={'sponsor-fund-unsubscriptions'}
                            params={{ organizationId: activeOrganization.id }}
                            className="card-section flex">
                            {requestsExpired > 0 && (
                                <div className="card-heading">
                                    <em className="mdi mdi-alert" />
                                    Urgente afmeldingen ({requestsExpired})
                                </div>
                            )}

                            {requestsExpired == 0 && requestsPending > 0 && (
                                <div className="card-heading">
                                    <em className="mdi mdi-alert-circle" />
                                    Afmeldingen ({requestsPending})
                                </div>
                            )}

                            {requestsExpired == 0 && requestsPending == 0 && (
                                <div className="card-heading">
                                    <em className="mdi mdi-alert-circle" />
                                    Geen nieuwe afmeldingen
                                </div>
                            )}

                            <div className="button button-text pull-right">
                                Bekijken
                                <em className="mdi mdi-arrow-right icon-end" />
                            </div>
                        </StateNavLink>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                {translate('provider_organizations.header.title')}
                                &nbsp;
                                <span className="span-count">{providerOrganizations.meta.total}</span>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="block block-inline-filters">
                                {filter.show && (
                                    <div className="button button-text" onClick={filter.resetFilters}>
                                        <em className="mdi mdi-close icon-start" />
                                        Wis filter
                                    </div>
                                )}
                                {!filter.show && (
                                    <div className="form">
                                        <div className="form-group form-group-inline">
                                            <label className="form-label">Sorteer op:</label>
                                            <div className="form-offset">
                                                <SelectControl
                                                    className={'form-control form-control-text nowrap'}
                                                    options={orderByOptions}
                                                    propKey={'value'}
                                                    allowSearch={false}
                                                    value={filterValues.order_by}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(order_by: string) => filterUpdate({ order_by })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                value={filterValues.q}
                                                onChange={(e) => filterUpdate({ q: e.target.value })}
                                                placeholder={translate('event_logs.labels.search')}
                                            />
                                        </div>
                                    </div>
                                )}

                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label="Accepteer budget">
                                        <div>
                                            <div className="radio">
                                                <input
                                                    id="allow_budget_yes"
                                                    type="radio"
                                                    name="allow_budget"
                                                    onChange={() => filterUpdate({ allow_budget: '1' })}
                                                    defaultValue={1}
                                                    checked={filterValues.allow_budget === '1'}
                                                />
                                                <label className="radio-label" htmlFor="allow_budget_yes">
                                                    <div className="radio-circle" />
                                                    Ja
                                                </label>
                                            </div>
                                            <div className="radio">
                                                <input
                                                    id="allow_budget_no"
                                                    type="radio"
                                                    name="allow_budget"
                                                    onChange={() => filterUpdate({ allow_budget: '0' })}
                                                    defaultValue={0}
                                                    checked={filterValues.allow_budget === '0'}
                                                />
                                                <label className="radio-label" htmlFor="allow_budget_no">
                                                    <div className="radio-circle" />
                                                    Nee
                                                </label>
                                            </div>
                                            <div className="radio">
                                                <input
                                                    id="allow_budget_all"
                                                    type="radio"
                                                    name="allow_budget"
                                                    onChange={() => filterUpdate({ allow_budget: null })}
                                                    defaultValue={null}
                                                    checked={filterValues.allow_budget === null}
                                                />
                                                <label className="radio-label" htmlFor="allow_budget_all">
                                                    <div className="radio-circle" />
                                                    Alles
                                                </label>
                                            </div>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Accepteer aanbiedingen">
                                        <div className="radio">
                                            <input
                                                id="allow_products_yes"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filterUpdate({ allow_products: '1' })}
                                                defaultValue={1}
                                                checked={filterValues.allow_products === '1'}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_yes">
                                                <div className="radio-circle" />
                                                Alle aanbiedingen
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_products_some"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filterUpdate({ allow_products: '-1' })}
                                                defaultValue={-1}
                                                checked={filterValues.allow_products === '-1'}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_some">
                                                <div className="radio-circle" />
                                                Sommige aanbiedingen
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_products_no"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filterUpdate({ allow_products: '0' })}
                                                defaultValue={0}
                                                checked={filterValues.allow_products === '0'}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_no">
                                                <div className="radio-circle" />
                                                Geen aanbiedingen
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_products_all"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filterUpdate({ allow_products: null })}
                                                defaultValue={null}
                                                checked={filterValues.allow_products === null}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_all">
                                                <div className="radio-circle" />
                                                Alles
                                            </label>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Levert producten">
                                        <div className="radio">
                                            <input
                                                id="has_products_yes"
                                                type="radio"
                                                name="has_products"
                                                onChange={() => filterUpdate({ has_products: '1' })}
                                                defaultValue={1}
                                                checked={filterValues.has_products === '1'}
                                            />
                                            <label className="radio-label" htmlFor="has_products_yes">
                                                <div className="radio-circle" />
                                                Ja
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="has_products_no"
                                                type="radio"
                                                name="has_products"
                                                onChange={() => filterUpdate({ has_products: '0' })}
                                                defaultValue={0}
                                                checked={filterValues.has_products === '0'}
                                            />
                                            <label className="radio-label" htmlFor="has_products_no">
                                                <div className="radio-circle" />
                                                Nee
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="has_products_all"
                                                type="radio"
                                                name="has_products"
                                                onChange={() => filterUpdate({ has_products: null })}
                                                defaultValue={null}
                                                checked={filterValues.has_products === null}
                                            />
                                            <label className="radio-label" htmlFor="has_products_all">
                                                <div className="radio-circle" />
                                                Alles
                                            </label>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Betaalmethode toestaan">
                                        <div className="radio">
                                            <input
                                                id="allow_extra_payments_yes"
                                                type="radio"
                                                name="allow_extra_payments"
                                                onChange={() => filterUpdate({ allow_extra_payments: '1' })}
                                                defaultValue={1}
                                                checked={filterValues.allow_extra_payments === '1'}
                                            />
                                            <label className="radio-label" htmlFor="allow_extra_payments_yes">
                                                <div className="radio-circle" />
                                                Ja
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_extra_payments_no"
                                                type="radio"
                                                name="allow_extra_payments"
                                                onChange={() => filterUpdate({ allow_extra_payments: '0' })}
                                                defaultValue={0}
                                                checked={filterValues.allow_extra_payments === '0'}
                                            />
                                            <label className="radio-label" htmlFor="allow_extra_payments_no">
                                                <div className="radio-circle" />
                                                Nee
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_extra_payments_all"
                                                type="radio"
                                                name="allow_extra_payments"
                                                onChange={() => filterUpdate({ allow_extra_payments: null })}
                                                defaultValue={null}
                                                checked={filterValues.allow_extra_payments === null}
                                            />
                                            <label className="radio-label" htmlFor="allow_extra_payments_all">
                                                <div className="radio-circle" />
                                                Alles
                                            </label>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Fondsen">
                                        <SelectControl
                                            className={'form-control'}
                                            options={funds}
                                            propKey={'id'}
                                            allowSearch={false}
                                            optionsComponent={SelectControlOptions}
                                            value={filterValues.fund_id}
                                            onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Implementatie">
                                        <SelectControl
                                            className={'form-control'}
                                            options={implementations}
                                            propKey={'id'}
                                            allowSearch={false}
                                            optionsComponent={SelectControlOptions}
                                            value={filterValues.implementation_id}
                                            onChange={(implementation_id: number) => {
                                                filterUpdate({ implementation_id });
                                            }}
                                        />
                                    </FilterItemToggle>

                                    <div className="form-actions">
                                        {providerOrganizations && (
                                            <button
                                                className="button button-primary button-wide"
                                                disabled={providerOrganizations.meta.total == 0}
                                                onClick={() => exportList()}>
                                                <em className="mdi mdi-download icon-start" />
                                                {translate('components.dropdown.export', {
                                                    total: providerOrganizations.meta.total,
                                                })}
                                            </button>
                                        )}
                                    </div>
                                </CardHeaderFilter>
                            </div>
                        </div>
                    </div>
                </div>

                <LoaderTableCard
                    loading={loading}
                    empty={providerOrganizations.meta.total == 0}
                    emptyTitle={'Je hebt nog geen verzoeken van aanbieders'}>
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <ThSortable
                                                label={translate('provider_organizations.labels.organization_name')}
                                            />
                                            <ThSortable
                                                label={translate('provider_organizations.labels.last_active')}
                                            />
                                            <ThSortable
                                                label={translate('provider_organizations.labels.product_count')}
                                            />
                                            <ThSortable
                                                label={translate('provider_organizations.labels.funds_count')}
                                            />
                                            <ThSortable
                                                className="text-right"
                                                label={translate('provider_organizations.labels.actions')}
                                            />
                                        </tr>
                                    </tbody>

                                    {providerOrganizations.data.map((providerOrganization) => (
                                        <ProvidersTableItem
                                            key={providerOrganization.id}
                                            organization={activeOrganization}
                                            providerOrganization={providerOrganization}
                                        />
                                    ))}
                                </table>
                            </div>
                        </div>
                    </div>

                    {providerOrganizations.meta.total > 0 && (
                        <div className="card-section">
                            <Paginator
                                meta={providerOrganizations.meta}
                                filters={filter.values}
                                updateFilters={filter.update}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </LoaderTableCard>
            </div>
        </Fragment>
    );
}
