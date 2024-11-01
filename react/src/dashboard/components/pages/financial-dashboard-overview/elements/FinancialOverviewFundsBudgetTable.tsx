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

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{
        q: string;
        year: number;
    }>(
        {
            q: '',
            year: new Date().getFullYear(),
        },
        {
            queryParams: {
                q: StringParam,
                year: NumberParam,
            },
            throttledValues: ['q'],
        },
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
            <div className="card-header">
                <div className="flex-row">
                    <div className="flex flex-grow">
                        <div className="flex-col card-title tooltipped">
                            Tegoeden
                            <Tooltip text={'De tegoeden die zijn toegekend via het systeem met de huidige status.'} />
                        </div>
                    </div>
                    <div className="flex">
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
            </div>

            {financialOverview?.year != filterValuesActive.year ? (
                <LoadingCard />
            ) : (
                <div className="card-section">
                    <div className="card-block card-block-table card-block-financial">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <ThSortable
                                            className="w-20"
                                            label={translate('financial_dashboard_overview.labels.fund_name')}
                                        />
                                        <ThSortable
                                            className="w-10"
                                            label={translate('financial_dashboard_overview.labels.total')}
                                        />
                                        <ThSortable
                                            className="w-15"
                                            label={translate('financial_dashboard_overview.labels.active')}
                                        />
                                        <ThSortable
                                            className="w-15"
                                            label={translate('financial_dashboard_overview.labels.inactive')}
                                        />
                                        <ThSortable
                                            className="w-15"
                                            label={translate('financial_dashboard_overview.labels.deactivated')}
                                        />
                                        <ThSortable
                                            className="w-15"
                                            label={translate('financial_dashboard_overview.labels.used')}
                                        />
                                        <ThSortable
                                            className={'text-right'}
                                            label={translate('financial_dashboard_overview.labels.left')}
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
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
