import React, { useCallback, useEffect, useState } from 'react';
import Tooltip from '../../../elements/tooltip/Tooltip';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import SelectControl from '../../../elements/select-control/SelectControl';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../../hooks/useSetProgress';
import { useFundService } from '../../../../services/FundService';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import useFundExporter from '../../../../services/exporters/useFundExporter';

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
    fetchFunds: (year?: number) => Promise<Array<Fund>>;
    fetchFinancialOverview: (year?: number) => Promise<FinancialOverview>;
    organization: Organization;
    year: number;
    setYear: (year: number) => void;
    setLoaded?: () => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundExporter = useFundExporter();

    const fundService = useFundService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(null);

    const { headElement, configsElement } = useConfigurableTable(fundService.getColumnsBalance());

    const exportFunds = useCallback(() => {
        fundExporter.exportData(organization.id, false, year);
    }, [fundExporter, organization.id, year]);

    useEffect(() => {
        setProgress(0);

        Promise.all([
            fetchFinancialOverview(year).then(setFinancialOverview),
            fetchFunds(year).then((funds) => setFunds(funds.filter((fund) => fund.budget))),
        ]).finally(() => setProgress(100));
    }, [fetchFinancialOverview, fetchFunds, year, setProgress]);

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
                                </tbody>
                            </table>
                        </TableTopScroller>
                    </div>
                </div>
            )}
        </div>
    );
}
