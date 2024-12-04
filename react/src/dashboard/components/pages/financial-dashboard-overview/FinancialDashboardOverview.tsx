import React, { Fragment, useCallback, useMemo } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import FinancialOverviewFundsTable from './elements/FinancialOverviewFundsTable';
import FinancialOverviewFundsBudgetTable from './elements/FinancialOverviewFundsBudgetTable';
import useTranslate from '../../../hooks/useTranslate';
import { ResponseError } from '../../../props/ApiResponses';
import usePushDanger from '../../../hooks/usePushDanger';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { FinancialOverview } from '../financial-dashboard/types/FinancialStatisticTypes';

export default function FinancialDashboardOverview() {
    const translate = useTranslate();
    const pushDanger = usePushDanger();

    const fundService = useFundService();
    const activeOrganization = useActiveOrganization();

    const years = useMemo<Array<{ id: number; name: string }>>(() => {
        const yearsList = [];

        for (let i = new Date().getFullYear(); i > new Date().getFullYear() - 5; i--) {
            yearsList.push({ id: i, name: i });
        }

        return yearsList;
    }, []);

    const fetchFunds = useCallback(
        (year?: number): Promise<Array<Fund>> => {
            return new Promise((resolve) =>
                fundService
                    .list(activeOrganization.id, { stats: 'all', per_page: 100, year: year })
                    .then((res) => resolve(res.data.data.filter((fund) => fund.state !== 'waiting')))
                    .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message)),
            );
        },
        [activeOrganization.id, fundService, pushDanger],
    );

    const fetchFinancialOverview = useCallback(
        (year?: number): Promise<FinancialOverview> => {
            return new Promise((resolve) => {
                fundService
                    .financialOverview(activeOrganization.id, { stats: 'all', year })
                    .then((res) => resolve(res.data))
                    .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
            });
        },
        [activeOrganization.id, fundService, pushDanger],
    );

    return (
        <Fragment>
            <div className="card-heading">{translate('financial_dashboard_overview.header.title')}</div>

            <FinancialOverviewFundsTable
                years={years}
                fetchFunds={fetchFunds}
                fetchFinancialOverview={fetchFinancialOverview}
                organization={activeOrganization}
            />

            <FinancialOverviewFundsBudgetTable
                years={years}
                fetchFunds={fetchFunds}
                fetchFinancialOverview={fetchFinancialOverview}
                organization={activeOrganization}
            />
        </Fragment>
    );
}
