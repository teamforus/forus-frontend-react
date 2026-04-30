import React, { useCallback, useEffect, useState } from 'react';
import Tooltip from '../../../elements/tooltip/Tooltip';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import SelectControl from '../../../elements/select-control/SelectControl';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';
import useFundExporter from '../../../../services/exporters/useFundExporter';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import { RequestConfig } from '../../../../props/ApiResponses';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function FinancialOverviewFundsTable({
    years,
    fetchFunds,
    fetchFinancialOverview,
    organization,
    year,
    setYear,
    setLoaded,
}: {
    years: Array<{ id: number; name: string }>;
    fetchFunds: (year?: number, config?: RequestConfig) => Promise<Array<Fund>>;
    fetchFinancialOverview: (year?: number, config?: RequestConfig) => Promise<FinancialOverview>;
    organization: Organization;
    year: number;
    setYear: (year: number) => void;
    setLoaded?: () => void;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const fundExporter = useFundExporter();

    const fundService = useFundService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(null);

    const exportFunds = useCallback(() => {
        fundExporter.exportData(organization.id, false, year);
    }, [fundExporter, organization.id, year]);

    useEffect(() => {
        runLatestRequest(
            async (config) => {
                return {
                    financialOverview: await fetchFinancialOverview(year, config),
                    funds: (await fetchFunds(year, config)).filter((fund) => fund.budget),
                };
            },
            {
                onSuccess: (res) => {
                    setFinancialOverview(res.financialOverview);
                    setFunds(res.funds);
                },
                onError: pushApiError,
            },
        );
    }, [fetchFinancialOverview, fetchFunds, year, pushApiError, runLatestRequest]);

    useEffect(() => {
        if (funds && financialOverview) {
            setLoaded();
        }
    }, [financialOverview, funds, setLoaded]);

    if (!funds?.length || !financialOverview || !years.length) {
        return <LoadingCard />;
    }

    return (
        <div className="card card-financial form">
            <div className="card-header">
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
                                    value={year}
                                    onChange={(year?: number) => setYear(year)}
                                />
                            </div>
                        </div>
                        <button
                            className="button button-primary button-sm"
                            data-dusk="exportFunds"
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
                <LoaderTableCard columns={fundService.getColumnsBalance()}>
                    {funds.map((fund) => (
                        <tr key={fund.id}>
                            <td>{fund.name}</td>
                            <td>{fund.budget?.total_locale || <TableEmptyValue />}</td>
                            <td>{fund.budget?.used_locale || <TableEmptyValue />}</td>
                            <td>{fund.budget?.left_locale || <TableEmptyValue />}</td>
                            <td>{fund.budget?.transaction_costs_locale}</td>
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
                        <td>{financialOverview?.funds.transaction_costs_locale}</td>
                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                </LoaderTableCard>
            )}
        </div>
    );
}
