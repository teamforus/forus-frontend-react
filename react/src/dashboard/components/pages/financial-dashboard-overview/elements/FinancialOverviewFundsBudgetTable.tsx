import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { currencyFormat } from '../../../../helpers/string';
import Tooltip from '../../../elements/tooltip/Tooltip';
import FinancialOverviewFundsBudgetTableItem from './FinancialOverviewFundsBudgetTableItem';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import SelectControl from '../../../elements/select-control/SelectControl';
import useSetProgress from '../../../../hooks/useSetProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import useFundExportService from '../../../../services/exports/useFundExportService';

export default function FinancialOverviewFundsBudgetTable({
    years,
    fetchFunds,
    fetchFinancialOverview,
    organization,
    year,
    setYear,
    loaded,
}: {
    years: Array<{ id: number; name: string }>;
    fetchFunds: (year: number) => Promise<Array<Fund>>;
    fetchFinancialOverview: (year: number) => Promise<FinancialOverview>;
    organization: Organization;
    year: number;
    setYear: (year: number) => void;
    loaded: boolean;
}) {
    const translate = useTranslate();
    const fundExportService = useFundExportService();

    const setProgress = useSetProgress();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(null);

    const budgetFunds = useMemo(() => {
        return funds?.filter((fund) => fund.type == 'budget' && fund.budget);
    }, [funds]);

    const fundService = useFundService();

    const { headElement, configsElement } = useConfigurableTable(fundService.getColumnsBudget());

    const exportFunds = useCallback(() => {
        fundExportService.exportData(organization.id, true, year);
    }, [fundExportService, organization.id, year]);

    useEffect(() => {
        if (!loaded) return;

        setProgress(0);

        Promise.all([
            fetchFinancialOverview(year).then(setFinancialOverview),
            fetchFunds(year).then((funds) => setFunds(funds)),
        ]).finally(() => setProgress(100));
    }, [fetchFinancialOverview, fetchFunds, year, setProgress, loaded]);

    if (!budgetFunds?.length || !years.length) {
        return loaded ? <LoadingCard /> : null;
    }

    return (
        <div className="card card-financial">
            <div className="card-header">
                <div className="card-title flex flex-grow tooltipped">
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
                                    value={year}
                                    onChange={(year?: number) => setYear(year)}
                                />
                            </div>
                        </div>
                        <button
                            className="button button-primary button-sm"
                            data-dusk="exportFundsDetailed"
                            onClick={() => exportFunds()}>
                            <em className="mdi mdi-download icon-start" />
                            {translate('financial_dashboard_overview.buttons.export')}
                        </button>
                    </div>
                </div>
            </div>

            {financialOverview?.year != year ? (
                <LoadingCard />
            ) : (
                <div className="card-section">
                    <div className="card-block card-block-table card-block-financial">
                        {configsElement}

                        <TableTopScroller>
                            <table className="table">
                                {headElement}

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
                                        <td>
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
