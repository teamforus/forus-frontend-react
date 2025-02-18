import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData } from '../../../props/ApiResponses';
import Paginator from '../../../modules/paginator/components/Paginator';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import TableRowActions from '../../elements/tables/TableRowActions';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import usePushApiError from '../../../hooks/usePushApiError';
import SponsorIdentity from '../../../props/models/Sponsor/SponsorIdentity';
import useSponsorIdentitiesService from '../../../services/SponsorIdentitesService';
import { NumberParam, StringParam } from 'use-query-params';
import TableDateTime from '../../elements/tables/elements/TableDateTime';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import TableDateOnly from '../../elements/tables/elements/TableDateOnly';
import useIdentityExportService from '../../../services/exports/useIdentityExportService';

export default function Identities() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const paginatorService = usePaginatorService();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const identityExportService = useIdentityExportService();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const [loading, setLoading] = useState(false);

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [identities, setIdentities] = useState<PaginationData<SponsorIdentity>>(null);

    const [states] = useState([
        { key: null, name: 'Alle' },
        { key: 'pending', name: 'In afwachting' },
        { key: 'success', name: 'Voltooid' },
    ]);

    const [paginatorTransactionsKey] = useState('payouts');

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        state: string;
        page?: number;
        fund_id?: number;
        per_page?: number;
    }>(
        {
            q: '',
            state: states[0].key,
            fund_id: null,
            page: 1,
            per_page: paginatorService.getPerPage(paginatorTransactionsKey),
        },
        {
            throttledValues: ['q'],
            queryParams: {
                q: StringParam,
                state: StringParam,
                page: NumberParam,
                fund_id: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    const { headElement, configsElement } = useConfigurableTable(
        sponsorIdentitiesService.getColumns(activeOrganization),
        { filter: filter, sortable: false, hasTooltips: true },
    );

    const { resetFilters: resetFilters, setShow } = filter;

    const exportIdentities = useCallback(() => {
        setShow(false);

        identityExportService.exportData(activeOrganization.id, {
            ...filter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, setShow, identityExportService]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id)
            .then((res) => setFunds([{ id: null, name: 'Selecteer fonds' }, ...res.data.data]))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, setProgress, pushApiError]);

    const fetchIdentities = useCallback(
        (query = {}) => {
            setLoading(true);
            setProgress(0);

            sponsorIdentitiesService
                .list(activeOrganization.id, { ...query })
                .then((res) => setIdentities(res.data))
                .catch(pushApiError)
                .finally(() => {
                    setLoading(false);
                    setProgress(100);
                });
        },
        [activeOrganization.id, setProgress, sponsorIdentitiesService, pushApiError],
    );

    useEffect(() => {
        fetchIdentities(filterValuesActive);
    }, [fetchIdentities, filterValuesActive]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!identities || !funds) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header card-header-next">
                <div className="card-title flex flex-grow">
                    {translate('identities.header.title')} ({identities.meta.total})
                </div>

                <div className={'card-header-filters'}>
                    <div className="block block-inline-filters">
                        <div className="form">
                            <div className="form-group">
                                <SelectControl
                                    className="form-control inline-filter-control"
                                    propKey={'id'}
                                    options={funds}
                                    value={filter.activeValues.fund_id}
                                    placeholder={translate('vouchers.labels.fund')}
                                    allowSearch={false}
                                    onChange={(fund_id: number) => filter.update({ fund_id })}
                                    optionsComponent={SelectControlOptionsFund}
                                />
                            </div>
                        </div>

                        {filter.show && (
                            <div className="button button-text" onClick={() => resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        value={filterValues.q}
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                        placeholder={translate('payouts.labels.search')}
                                    />
                                </div>
                            </div>
                        )}

                        <CardHeaderFilter filter={filter}>
                            <FilterItemToggle label={translate('payouts.labels.search')} show={true}>
                                <input
                                    className="form-control"
                                    value={filterValues.q}
                                    onChange={(e) => filterUpdate({ q: e.target.value })}
                                    placeholder={translate('payouts.labels.search')}
                                />
                            </FilterItemToggle>

                            <div className="form-actions">
                                <button
                                    className="button button-primary button-wide"
                                    onClick={exportIdentities}
                                    disabled={identities.meta.total == 0}>
                                    <em className="mdi mdi-download icon-start" />
                                    {translate('components.dropdown.export', { total: identities.meta.total })}
                                </button>
                            </div>
                        </CardHeaderFilter>
                    </div>
                </div>
            </div>

            <LoaderTableCard loading={loading} empty={identities.meta.total == 0} emptyTitle={'Geen personen gevonden'}>
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {identities.data.map((identity) => (
                                        <StateNavLink
                                            key={identity.id}
                                            name={'identities-show'}
                                            params={{
                                                organizationId: activeOrganization.id,
                                                id: identity.id,
                                            }}
                                            className={'tr-clickable'}
                                            customElement={'tr'}>
                                            <td>{identity.id}</td>
                                            <td>
                                                {identity?.records?.given_name?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                {identity?.records?.family_name?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>{identity.email || <TableEmptyValue />}</td>
                                            {activeOrganization.bsn_enabled && (
                                                <td>{identity.bsn || <TableEmptyValue />}</td>
                                            )}
                                            <td>
                                                {identity?.records?.client_number?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                <TableDateOnly
                                                    value={identity?.records?.birth_date?.[0]?.value_locale}
                                                />
                                            </td>
                                            <td>
                                                <TableDateTime value={identity.last_login_at_locale} />
                                            </td>
                                            <td>
                                                <TableDateTime value={identity.last_activity_at_locale} />
                                            </td>
                                            <td>{identity?.records?.city?.[0]?.value_locale || <TableEmptyValue />}</td>
                                            <td>
                                                {identity?.records?.street?.[0]?.value_locale || <TableEmptyValue />}
                                            </td>
                                            <td>
                                                {identity?.records?.house_number?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                {identity?.records?.house_number_addition?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                {identity?.records?.postal_code?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                {identity?.records?.municipality_name?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>
                                            <td>
                                                {identity?.records?.neighborhood_name?.[0]?.value_locale || (
                                                    <TableEmptyValue />
                                                )}
                                            </td>

                                            <td className={'table-td-actions'}>
                                                <TableRowActions
                                                    content={() => (
                                                        <div className="dropdown dropdown-actions">
                                                            <StateNavLink
                                                                name={'identities-show'}
                                                                className="dropdown-item"
                                                                params={{
                                                                    organizationId: activeOrganization.id,
                                                                    id: identity.id,
                                                                }}>
                                                                <em className="mdi mdi-eye icon-start" /> Bekijken
                                                            </StateNavLink>
                                                        </div>
                                                    )}
                                                />
                                            </td>
                                        </StateNavLink>
                                    ))}
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>

                {identities.meta.total > 0 && (
                    <div className="card-section">
                        <Paginator
                            meta={identities.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorTransactionsKey}
                        />
                    </div>
                )}
            </LoaderTableCard>
        </div>
    );
}
