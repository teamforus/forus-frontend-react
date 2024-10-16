import React, { Fragment } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import FinancialOverviewFundsTable from './elements/FinancialOverviewFundsTable';
import FinancialOverviewFundsBudgetTable from './elements/FinancialOverviewFundsBudgetTable';
import useTranslate from '../../../hooks/useTranslate';

export default function FinancialDashboardOverview() {
    const translate = useTranslate();
    const activeOrganization = useActiveOrganization();

    return (
        <Fragment>
            <div className="card-heading">{translate('financial_dashboard_overview.header.title')}</div>

            <FinancialOverviewFundsTable organization={activeOrganization} />

            <FinancialOverviewFundsBudgetTable organization={activeOrganization} />
        </Fragment>
    );
}
