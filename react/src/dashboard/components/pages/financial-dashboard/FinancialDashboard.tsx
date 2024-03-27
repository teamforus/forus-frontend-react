import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import ProviderFinancialTable from './elements/ProviderFinancialTable';
import FinancialStatistics from './elements/FinancialStatistics';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import FinancialChart from './elements/FinancialChart';
import FinancialFilters from './elements/FinancialFilters';
import { useFundService } from '../../../services/FundService';
import useSetProgress from '../../../hooks/useSetProgress';
import ProviderFinancialStatistics, {
    ProviderFinancialFilterOptions,
} from '../../../services/types/ProviderFinancialStatistics';
import usePushDanger from '../../../hooks/usePushDanger';

export default function FinancialDashboard() {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [options, setOptions] = useState<ProviderFinancialFilterOptions>(null);
    const [chartData, setChartData] = useState<ProviderFinancialStatistics>(null);
    const [externalFilters, setExternalFilters] = useState(null);

    const onQueryChange = useCallback((query) => setExternalFilters(query), []);

    useEffect(() => {
        // wait for external filters to prevent not filtered requests
        if (externalFilters) {
            setProgress(0);

            fundService
                .readFinances(activeOrganization.id, externalFilters)
                .then((res) => setChartData(res.data))
                .catch((res) => pushDanger('Mislukt!', res.data.message))
                .finally(() => setProgress(100));
        }
    }, [activeOrganization.id, fundService, externalFilters, setProgress, pushDanger]);

    useEffect(() => {
        fundService
            .readFinances(activeOrganization.id, { filters: 1 })
            .then((res) => setOptions(res.data.filters))
            .catch((res) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, fundService, pushDanger]);

    if (!options) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading">{t('financial_dashboard.header.title')}</div>
            <div className="block block-financial-dashboard">
                <FinancialFilters options={options} onQueryChange={onQueryChange} />

                {chartData && (
                    <Fragment>
                        <FinancialChart chartData={chartData} />
                        <FinancialStatistics chartData={chartData} />
                        <ProviderFinancialTable externalFilters={externalFilters} />
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
}
