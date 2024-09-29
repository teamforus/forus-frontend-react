import React, { useCallback, useEffect, useState } from 'react';
import ThSortable from '../../../elements/tables/ThSortable';
import Tooltip from '../../../elements/tooltip/Tooltip';
import Fund from '../../../../props/models/Fund';
import useExportFunds from '../hooks/useExportFunds';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import { ResponseError } from '../../../../props/ApiResponses';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../../services/FundService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import usePushDanger from '../../../../hooks/usePushDanger';

export default function FinancialOverviewFundsTable({ organization }: { organization: Organization }) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const exportFunds = useExportFunds(organization);
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [year, setYear] = useState(new Date().getFullYear());
    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [years, setYears] = useState<Array<{ id: number; name: number }>>([]);
    const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(null);

    const fetchFunds = useCallback(() => {
        fundService
            .list(activeOrganization.id, { stats: 'all', per_page: 100, year: year })
            .then((res) => setFunds(res.data.data.filter((fund) => fund.state !== 'waiting')))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, fundService, pushDanger, year]);

    const fetchFinancialOverview = useCallback(() => {
        fundService
            .financialOverview(activeOrganization.id, { stats: 'all', year: year })
            .then((res) => setFinancialOverview(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, fundService, pushDanger, year]);

    const buildYearsList = useCallback(() => {
        const yearsList = [];

        for (let i = new Date().getFullYear(); i > new Date().getFullYear() - 5; i--) {
            yearsList.push({ id: i, name: i });
        }

        return yearsList;
    }, []);

    useEffect(() => {
        setYears(buildYearsList());
    }, [buildYearsList]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchFinancialOverview();
    }, [fetchFinancialOverview]);

    if (!funds || !financialOverview || !years.length) {
        return <LoadingCard />;
    }

    return (
        <div className="card card-financial form">
            <div className="card-header">
                <div className="flex-row">
                    <div className="flex flex-grow">
                        <div className="flex-col card-title tooltipped">
                            Saldo en uitgaven
                            <Tooltip text={'Saldo en uitgaven van de gekoppelde bankrekening per fonds.'} />
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
                                        value={year}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(year?: number) => setYear(year)}
                                    />
                                </div>
                            </div>
                            <button className="button button-primary button-sm" onClick={() => exportFunds(false)}>
                                <em className="mdi mdi-download icon-start" />
                                {translate('financial_dashboard_overview.buttons.export')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-table card-block-financial">
                    <div className="table-wrapper">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <ThSortable label={translate('financial_dashboard_overview.labels.fund_name')} />
                                    <ThSortable label={translate('financial_dashboard_overview.labels.total_budget')} />
                                    <ThSortable label={translate('financial_dashboard_overview.labels.used_budget')} />
                                    <ThSortable
                                        label={translate('financial_dashboard_overview.labels.current_budget')}
                                    />
                                    <ThSortable
                                        className={'text-right'}
                                        label={translate('financial_dashboard_overview.labels.transaction_costs')}
                                    />
                                </tr>

                                {funds.map((fund) => (
                                    <tr key={fund.id}>
                                        <td>{fund.name}</td>
                                        <td>{fund.budget?.total_locale || <TableEmptyValue />}</td>
                                        <td>{fund.budget?.used_locale || <TableEmptyValue />}</td>
                                        <td>{fund.budget?.left_locale || <TableEmptyValue />}</td>
                                        <td className={'text-right'}>{fund.budget?.transaction_costs_locale}</td>
                                    </tr>
                                ))}

                                <tr className="table-totals">
                                    <td>{translate('financial_dashboard_overview.labels.total')}</td>
                                    <td>{financialOverview?.funds.budget_locale}</td>
                                    <td>{financialOverview?.funds.budget_used_locale}</td>
                                    <td>{financialOverview?.funds.budget_left_locale}</td>
                                    <td className={'text-right'}>
                                        {financialOverview?.funds.transaction_costs_locale}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
