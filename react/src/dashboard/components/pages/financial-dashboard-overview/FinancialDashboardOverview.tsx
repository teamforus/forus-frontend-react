import React, { Fragment, useCallback, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import FinancialOverviewFundsTable from './elements/FinancialOverviewFundsTable';
import FinancialOverviewFundsBudgetTable from './elements/FinancialOverviewFundsBudgetTable';
import useTranslate from '../../../hooks/useTranslate';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { FinancialOverview } from '../financial-dashboard/types/FinancialStatisticTypes';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam } from 'use-query-params';
import { RequestConfig } from '../../../props/ApiResponses';

export default function FinancialDashboardOverview() {
    const translate = useTranslate();

    const fundService = useFundService();
    const activeOrganization = useActiveOrganization();

    const [overviewLoaded, setOverviewLoaded] = useState(false);

    const [, filterValuesActive, filterUpdate] = useFilterNext<{ year_all: number; year: number }>(
        { year_all: new Date().getFullYear(), year: new Date().getFullYear() },
        { queryParams: { year_all: NumberParam, year: NumberParam } },
    );

    const years = useMemo<Array<{ id: number; name: string }>>(() => {
        const yearsList = [];

        for (let i = new Date().getFullYear(); i > new Date().getFullYear() - 5; i--) {
            yearsList.push({ id: i, name: i });
        }

        return yearsList;
    }, []);

    const fetchFunds = useCallback(
        async (year?: number, config: RequestConfig = {}): Promise<Array<Fund>> => {
            const res = await fundService.list(
                activeOrganization.id,
                { stats: 'all', per_page: 100, year: year },
                config,
            );

            return res.data.data.filter((fund) => fund.state !== 'waiting');
        },
        [activeOrganization.id, fundService],
    );

    const fetchFinancialOverview = useCallback(
        async (year?: number, config: RequestConfig = {}): Promise<FinancialOverview> => {
            return (await fundService.financialOverview(activeOrganization.id, { stats: 'all', year }, config)).data;
        },
        [activeOrganization.id, fundService],
    );

    return (
        <Fragment>
            <div className="card-heading">{translate('financial_dashboard_overview.header.title')}</div>

            <FinancialOverviewFundsTable
                years={years}
                fetchFunds={fetchFunds}
                fetchFinancialOverview={fetchFinancialOverview}
                organization={activeOrganization}
                year={filterValuesActive.year_all}
                setYear={(year) => filterUpdate({ year_all: year })}
                setLoaded={() => setOverviewLoaded(true)}
            />

            <FinancialOverviewFundsBudgetTable
                years={years}
                fetchFunds={fetchFunds}
                fetchFinancialOverview={fetchFinancialOverview}
                organization={activeOrganization}
                year={filterValuesActive.year}
                loaded={overviewLoaded}
                setYear={(year) => filterUpdate({ year: year })}
            />
        </Fragment>
    );
}
