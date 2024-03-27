import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import FinancialOverviewFundsTable from './elements/FinancialOverviewFundsTable';
import FinancialOverviewFundsBudgetTable from './elements/FinancialOverviewFundsBudgetTable';
import { ResponseError } from '../../../props/ApiResponses';
import usePushDanger from '../../../hooks/usePushDanger';
import Fund from '../../../props/models/Fund';
import FinancialOverview from '../../../services/types/FinancialOverview';

export default function FinancialDashboardOverview() {
    const { t } = useTranslation();
    const activeOrganization = useActiveOrganization();

    const pushDanger = usePushDanger();
    const fundService = useFundService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(null);

    const fetchFunds = useCallback(() => {
        fundService
            .list(activeOrganization.id, { stats: 'all', per_page: 100 })
            .then((res) => setFunds(res.data.data.filter((fund) => fund.state !== 'waiting')))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, fundService, pushDanger]);

    const fetchFinancialOverview = useCallback(() => {
        fundService
            .financialOverview(activeOrganization.id, { stats: 'all' })
            .then((res) => setFinancialOverview(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, fundService, pushDanger]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchFinancialOverview();
    }, [fetchFinancialOverview]);

    if (!funds || !financialOverview) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading">{t('financial_dashboard_overview.header.title')}</div>

            <FinancialOverviewFundsTable
                funds={funds}
                organization={activeOrganization}
                fundsFinancialOverview={financialOverview}
            />

            <FinancialOverviewFundsBudgetTable
                funds={funds}
                organization={activeOrganization}
                financialOverview={financialOverview}
            />
        </Fragment>
    );
}
