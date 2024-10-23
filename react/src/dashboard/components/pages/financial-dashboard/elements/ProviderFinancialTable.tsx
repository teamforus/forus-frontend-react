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
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import { format } from 'date-fns';
import { useFileService } from '../../../../services/FileService';
import usePushDanger from '../../../../hooks/usePushDanger';
import { FinancialFiltersQuery } from './FinancialFilters';
import { ProviderFinancial } from '../types/FinancialStatisticTypes';
import EmptyCard from '../../../elements/empty-card/EmptyCard';

type ProviderFinancialLocal = ProviderFinancial & { id: string };

export default function ProviderFinancialTable({ externalFilters }: { externalFilters?: FinancialFiltersQuery }) {
    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const fileService = useFileService();
    const paginatorService = usePaginatorService();
    const organizationService = useOrganizationService();

    const [paginatorKey] = useState('provider_finances');
    const [showTransactions, setShowTransactions] = useState<Array<string>>([]);
    const [providersFinances, setProvidersFinances] = useState<PaginationData<ProviderFinancialLocal>>(null);

    const filter = useFilter({
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const financeProvidersExport = useCallback(() => {
        organizationService
            .financeProvidersExport(activeOrganization.id, { ...externalFilters, ...filter.activeValues })
            .then((res) => {
                const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                const fileName = `financial-dashboard_${activeOrganization.name}_${dateTime}.xls`;
                const fileType = res.headers['content-type'] + ';charset=utf-8;';

                fileService.downloadFile(fileName, res.data, fileType);
            })
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [
        organizationService,
        activeOrganization.id,
        activeOrganization.name,
        externalFilters,
        filter?.activeValues,
        fileService,
        pushDanger,
    ]);

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
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [organizationService, activeOrganization?.id, filter?.activeValues, externalFilters, pushDanger]);

    useEffect(() => fetchProviderFinances(), [fetchProviderFinances]);

    if (!providersFinances) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {providersFinances.data.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div className="flex-row">
                            <div className="flex-col flex-grow">
                                <div className="card-title">Aanbieders</div>
                            </div>
                            <div className="flex-col">
                                <button className="button button-primary" onClick={() => financeProvidersExport()}>
                                    <em className="mdi mdi-download icon-start" />
                                    <span>Exporteren</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <ThSortable label="Aanbieder" />
                                            <ThSortable label="Totaal uitgegeven" />
                                            <ThSortable label="Hoogste aankoopbedrag" />
                                            <ThSortable label="Aantal transacties" />
                                            <ThSortable className="text-right" label="Transacties" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {providersFinances.data.map((provider) => (
                                            <Fragment key={provider.id}>
                                                <tr>
                                                    <td className="text-primary-light">
                                                        <img
                                                            className="organization-logo"
                                                            src={
                                                                provider.provider.logo?.sizes?.thumbnail ||
                                                                './assets/img/placeholders/organization-thumbnail.png'
                                                            }
                                                            alt={provider.provider.name}
                                                        />
                                                        <span>{provider.provider.name}</span>
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
                                                    <td className="text-right">
                                                        {provider.nr_transactions > 0 && (
                                                            <button
                                                                className="button button-primary"
                                                                onClick={() => toggleTransactionsTable(provider.id)}>
                                                                <em className="mdi mdi-cash-multiple icon-start" />
                                                                <span>Transacties</span>
                                                            </button>
                                                        )}
                                                    </td>
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
                            </div>
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
