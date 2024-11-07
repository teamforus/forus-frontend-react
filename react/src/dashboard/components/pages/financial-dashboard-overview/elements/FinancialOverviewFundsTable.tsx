import React, { useEffect, useState } from 'react';
import Tooltip from '../../../elements/tooltip/Tooltip';
import Fund from '../../../../props/models/Fund';
import useExportFunds from '../hooks/useExportFunds';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import useSetProgress from '../../../../hooks/useSetProgress';
import { useFundService } from '../../../../services/FundService';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';

export default function FinancialOverviewFundsTable({
    years,
    fetchFunds,
    fetchFinancialOverview,
    organization,
}: {
    years: Array<{ id: number; name: string }>;
    fetchFunds: (year: number) => Promise<Array<Fund>>;
    fetchFinancialOverview: (year: number) => Promise<FinancialOverview>;
    organization: Organization;
}) {
    const translate = useTranslate();
    const exportFunds = useExportFunds(organization);

    const setProgress = useSetProgress();

    const fundService = useFundService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(null);

    const { headElement, configsElement } = useConfigurableTable(fundService.getColumnsBalance());

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{ q: string; year_all: number }>(
        { q: '', year_all: new Date().getFullYear() },
        { queryParams: { q: StringParam, year_all: NumberParam }, throttledValues: ['q'] },
    );

    useEffect(() => {
        fetchFunds(filterValuesActive.year_all).then(setFunds);
    }, [fetchFunds, filterValuesActive.year_all]);

    useEffect(() => {
        setProgress(0);

        fetchFinancialOverview(filterValuesActive.year_all)
            .then(setFinancialOverview)
            .finally(() => setProgress(100));
    }, [fetchFinancialOverview, filterValuesActive.year_all, setProgress]);

    if (!funds?.length || !financialOverview || !years.length) {
        return <LoadingCard />;
    }

    return (
        <div className="card card-financial form">
            <div className="card-header card-header-next">
                <div className="card-title flex flex-grow tooltipped">
                    Saldo en uitgaven
                    <Tooltip text={'Saldo en uitgaven van de gekoppelde bankrekening per fonds.'} />
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <div className="form">
                            <div className="form-group">
                                <SelectControl
                                    className={'form-control'}
                                    options={years}
                                    propKey={'id'}
                                    allowSearch={false}
                                    value={filterValues.year_all}
                                    optionsComponent={SelectControlOptions}
                                    onChange={(year?: number) => filterUpdate({ year_all: year })}
                                />
                            </div>
                        </div>
                        <button
                            className="button button-primary button-sm"
                            onClick={() => exportFunds(false, filterValuesActive.year_all)}>
                            <em className="mdi mdi-download icon-start" />
                            {translate('financial_dashboard_overview.buttons.export')}
                        </button>
                    </div>
                </div>
            </div>

            {financialOverview?.year != filterValuesActive.year_all ? (
                <LoadingCard />
            ) : (
                <div className="card-section">
                    <div className="card-block card-block-table card-block-financial">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

                                <tbody>
                                    {funds.map((fund) => (
                                        <tr key={fund.id}>
                                            <td>{fund.name}</td>
                                            <td>{fund.budget?.total_locale || <TableEmptyValue />}</td>
                                            <td>{fund.budget?.used_locale || <TableEmptyValue />}</td>
                                            <td>{fund.budget?.left_locale || <TableEmptyValue />}</td>
                                            <td className={'text-right'}>{fund.budget?.transaction_costs_locale}</td>
                                            <td className={'table-td-actions text-right'}>
                                                <TableEmptyValue />
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="table-totals">
                                        <td>{translate('financial_dashboard_overview.labels.total')}</td>
                                        <td>{financialOverview?.funds.budget_locale}</td>
                                        <td>{financialOverview?.funds.budget_used_locale}</td>
                                        <td>{financialOverview?.funds.budget_left_locale}</td>
                                        <td className={'text-right'}>
                                            {financialOverview?.funds.transaction_costs_locale}
                                        </td>
                                        <td className={'table-td-actions text-right'}>
                                            <TableEmptyValue />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}
        </div>
    );
}
