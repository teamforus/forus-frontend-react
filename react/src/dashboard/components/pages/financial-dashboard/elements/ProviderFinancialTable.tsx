import React, { Fragment, useCallback, useEffect, useState } from 'react';
import ThSortable from '../../../elements/tables/ThSortable';
import ProviderFinancialTablesTransactions from './ProviderFinancialTablesTransactions';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import { useOrganizationService } from '../../../../services/OrganizationService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { uniqueId } from 'lodash';
import { PaginationData } from '../../../../props/ApiResponses';
import { FinancialFiltersQuery } from './FinancialFilters';
import { ProviderFinancial } from '../types/FinancialStatisticTypes';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import usePushApiError from '../../../../hooks/usePushApiError';
import useProviderFinancialExportService from '../../../../services/exports/useProviderFinancialExportService';

type ProviderFinancialLocal = ProviderFinancial & { id: string };

export default function ProviderFinancialTable({ externalFilters }: { externalFilters?: FinancialFiltersQuery }) {
    const pushApiError = usePushApiError();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const organizationService = useOrganizationService();
    const providerFinancialExportService = useProviderFinancialExportService();

    const [paginatorKey] = useState('provider_finances');
    const [showTransactions, setShowTransactions] = useState<Array<string>>([]);
    const [providersFinances, setProvidersFinances] = useState<PaginationData<ProviderFinancialLocal>>(null);

    const filter = useFilter({
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const financeProvidersExport = useCallback(() => {
        providerFinancialExportService.exportData(activeOrganization.id, {
            ...externalFilters,
            ...filter.activeValues,
        });
    }, [activeOrganization.id, externalFilters, filter?.activeValues, providerFinancialExportService]);

    const toggleTransactionsTable = useCallback((id: string) => {
        setShowTransactions((list) => {
            if (list.includes(id)) {
                list.splice(list.indexOf(id), 1);
            } else {
                list.push(id);
            }

            return [...list];
        });
    }, []);

    const fetchProviderFinances = useCallback(() => {
        organizationService
            .financeProviders(activeOrganization.id, { ...externalFilters, ...filter.activeValues })
            .then((res) => {
                setShowTransactions([]);

                setProvidersFinances({
                    ...res.data,
                    data: res.data.data.map((provider) => ({ id: uniqueId(), ...provider })),
                });
            })
            .catch(pushApiError);
    }, [organizationService, activeOrganization?.id, filter?.activeValues, externalFilters, pushApiError]);

    useEffect(() => fetchProviderFinances(), [fetchProviderFinances]);

    if (!providersFinances) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {providersFinances.data.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div className="flex flex-grow card-title">Aanbieders</div>

                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                <button
                                    className="button button-primary"
                                    data-dusk="export"
                                    onClick={() => financeProvidersExport()}>
                                    <em className="mdi mdi-download icon-start" />
                                    <span>Exporteren</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <TableTopScroller>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <ThSortable label="Aanbieder" />
                                            <ThSortable label="Besteed" />
                                            <ThSortable label="Hoogste aankoopbedrag" />
                                            <ThSortable label="Aantal transacties" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {providersFinances.data.map((provider) => (
                                            <Fragment key={provider.id}>
                                                <tr
                                                    className={'tr-clickable table-separator'}
                                                    onClick={() => toggleTransactionsTable(provider.id)}>
                                                    <td>
                                                        <div className="flex flex-align-items-center">
                                                            <img
                                                                className="organization-logo"
                                                                src={
                                                                    provider.provider.logo?.sizes?.thumbnail ||
                                                                    './assets/img/placeholders/organization-thumbnail.png'
                                                                }
                                                                alt={provider.provider.name}
                                                            />

                                                            {provider.nr_transactions > 0 ? (
                                                                showTransactions.includes(provider.id) ? (
                                                                    <em className="mdi mdi-menu-down td-menu-icon" />
                                                                ) : (
                                                                    <em className="mdi mdi-menu-right td-menu-icon" />
                                                                )
                                                            ) : (
                                                                <div style={{ width: '10px' }} />
                                                            )}

                                                            <strong>{provider.provider.name}</strong>
                                                        </div>
                                                    </td>
                                                    <td className={!provider.total_spent ? 'text-muted' : ''}>
                                                        {provider.total_spent
                                                            ? provider.total_spent_locale
                                                            : 'Geen transacties'}
                                                    </td>
                                                    <td className={!provider.highest_transaction ? 'text-muted' : ''}>
                                                        {provider.highest_transaction
                                                            ? provider.highest_transaction_locale
                                                            : 'Geen transacties'}
                                                    </td>
                                                    <td>{provider.nr_transactions}</td>
                                                </tr>

                                                {showTransactions.includes(provider.id) && (
                                                    <tr>
                                                        <td className="td-paddless" colSpan={5}>
                                                            <ProviderFinancialTablesTransactions
                                                                provider={provider.provider}
                                                                organization={activeOrganization}
                                                                externalFilters={externalFilters}
                                                            />
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </TableTopScroller>
                        </div>
                    </div>

                    {providersFinances?.meta && (
                        <div className="card-section">
                            <Paginator
                                meta={providersFinances.meta}
                                filters={filter.values}
                                updateFilters={filter.update}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </div>
            )}

            {providersFinances.meta.total == 0 && <EmptyCard title={'Geen aanbieder.'} />}
        </Fragment>
    );
}
