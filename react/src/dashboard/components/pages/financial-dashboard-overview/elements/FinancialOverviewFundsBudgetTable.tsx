import React, { useCallback, useEffect, useState } from 'react';
import ThSortable from '../../../elements/tables/ThSortable';
import { currencyFormat } from '../../../../helpers/string';
import Tooltip from '../../../elements/tooltip/Tooltip';
import FinancialOverviewFundsBudgetTableItem from './FinancialOverviewFundsBudgetTableItem';
import useExportFunds from '../hooks/useExportFunds';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import { ResponseError } from '../../../../props/ApiResponses';
import { useFundService } from '../../../../services/FundService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import usePushDanger from '../../../../hooks/usePushDanger';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';

export default function FinancialOverviewFundsBudgetTable({ organization }: { organization: Organization }) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const exportFunds = useExportFunds(organization);
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [year, setYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState<Array<{ id: number; name: number }>>([]);
    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [budgetFunds, setBudgetFunds] = useState<Array<Fund>>(null);
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

    useEffect(() => {
        setBudgetFunds(funds?.filter((fund) => fund.type == 'budget'));
    }, [funds]);

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
                                        value={year}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(year?: number) => setYear(year)}
                                    />
                                </div>
                            </div>
                            <button className="button button-primary button-sm" onClick={() => exportFunds(true)}>
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
        </div>
    );
}
