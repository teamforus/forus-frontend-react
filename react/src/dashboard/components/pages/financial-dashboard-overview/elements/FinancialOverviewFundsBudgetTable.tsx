import React, { useEffect, useMemo, useState } from 'react';
import ThSortable from '../../../elements/tables/ThSortable';
import { currencyFormat } from '../../../../helpers/string';
import Tooltip from '../../../elements/tooltip/Tooltip';
import FinancialOverviewFundsBudgetTableItem from './FinancialOverviewFundsBudgetTableItem';
import useExportFunds from '../hooks/useExportFunds';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { NumberParam, StringParam } from 'use-query-params';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableTopScrollerConfigTh from '../../../elements/tables/TableTopScrollerConfigTh';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function FinancialOverviewFundsBudgetTable({
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

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(null);

    const budgetFunds = useMemo(() => {
        return funds?.filter((fund) => fund.type == 'budget');
    }, [funds]);

    const fundService = useFundService();

    const {
        columns,
        configsElement,
        showTableTooltip,
        hideTableTooltip,
        tableConfigCategory,
        showTableConfig,
        displayTableConfig,
    } = useConfigurableTable(fundService.getColumnsBudget());

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{ q: string; year: number }>(
        { q: '', year: new Date().getFullYear() },
        { queryParams: { q: StringParam, year: NumberParam }, throttledValues: ['q'] },
    );

    useEffect(() => {
        fetchFunds(filterValuesActive.year).then(setFunds);
    }, [fetchFunds, filterValuesActive.year]);

    useEffect(() => {
        setProgress(0);

        fetchFinancialOverview(filterValuesActive.year)
            .then(setFinancialOverview)
            .finally(() => setProgress(100));
    }, [fetchFinancialOverview, filterValuesActive.year, setProgress]);

    if (!budgetFunds?.length || !years.length) {
        return null;
    }

    return (
        <div className="card card-financial">
            <div className="card-header card-header-next">
                <div className="flex-col card-title flex flex-grow tooltipped">
                    Tegoeden
                    <Tooltip text={'De tegoeden die zijn toegekend via het systeem met de huidige status.'} />
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
                                    value={filterValues.year}
                                    optionsComponent={SelectControlOptions}
                                    onChange={(year?: number) => filterUpdate({ year })}
                                />
                            </div>
                        </div>
                        <button
                            className="button button-primary button-sm"
                            onClick={() => exportFunds(true, filterValuesActive.year)}>
                            <em className="mdi mdi-download icon-start" />
                            {translate('financial_dashboard_overview.buttons.export')}
                        </button>
                    </div>
                </div>
            </div>

            {financialOverview?.year != filterValuesActive.year ? (
                <LoadingCard />
            ) : (
                <div className="card-section">
                    <div className="card-block card-block-table card-block-financial">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                <thead>
                                    <tr>
                                        {columns.map((column, index: number) => (
                                            <ThSortable
                                                key={index}
                                                onMouseOver={() => showTableTooltip(column.tooltip?.key)}
                                                onMouseLeave={() => hideTableTooltip()}
                                                label={translate(column.label)}
                                            />
                                        ))}

                                        <TableTopScrollerConfigTh
                                            showTableConfig={showTableConfig}
                                            displayTableConfig={displayTableConfig}
                                            tableConfigCategory={tableConfigCategory}
                                        />
                                    </tr>
                                </thead>

                                {budgetFunds.map((fund) => (
                                    <FinancialOverviewFundsBudgetTableItem key={fund.id} fund={fund} />
                                ))}

                                <tbody>
                                    <tr className="table-totals">
                                        <td>{translate('financial_dashboard_overview.labels.total')}</td>
                                        <td>{financialOverview?.budget_funds.vouchers_amount_locale}</td>
                                        <td>{financialOverview?.budget_funds.active_vouchers_amount_locale}</td>
                                        <td>{financialOverview?.budget_funds.inactive_vouchers_amount_locale}</td>
                                        <td>{financialOverview?.budget_funds.deactivated_vouchers_amount_locale}</td>
                                        <td>{financialOverview?.budget_funds.budget_used_active_vouchers_locale}</td>
                                        <td className={'text-right'}>
                                            {currencyFormat(
                                                parseFloat(financialOverview?.budget_funds.vouchers_amount) -
                                                    financialOverview?.budget_funds.budget_used_active_vouchers,
                                            )}
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
