import React, { useEffect, useState } from 'react';
import ThSortable from '../../../elements/tables/ThSortable';
import { currencyFormat } from '../../../../helpers/string';
import Tooltip from '../../../elements/tooltip/Tooltip';
import FinancialOverviewFundsBudgetTableItem from './FinancialOverviewFundsBudgetTableItem';
import useExportFunds from '../hooks/useExportFunds';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import { useFundService } from '../../../../services/FundService';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableTopScrollerConfigTh from '../../../elements/tables/TableTopScrollerConfigTh';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function FinancialOverviewFundsBudgetTable({
    funds,
    organization,
    financialOverview,
}: {
    funds: Array<Fund>;
    organization: Organization;
    financialOverview: FinancialOverview;
}) {
    const translate = useTranslate();
    const exportFunds = useExportFunds(organization);

    const [budgetFunds, setBudgetFunds] = useState<Array<Fund>>(null);

    const fundService = useFundService();

    const {
        columns,
        configsElement,
        showTableTooltip,
        hideTableTooltip,
        tableConfigCategory,
        showTableConfig,
        displayTableConfig,
    } = useConfigurableTable(fundService.getColumnsBudget());

    useEffect(() => {
        setBudgetFunds(funds.filter((fund) => fund.state == 'active' && fund.type == 'budget'));
    }, [funds]);

    if (!budgetFunds?.length) {
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
                        <button className="button button-primary button-sm" onClick={() => exportFunds(true)}>
                            <em className="mdi mdi-download icon-start" />
                            {translate('financial_dashboard_overview.buttons.export')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-section">
                <div className="card-block card-block-table card-block-financial">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            <thead>
                                <tr>
                                    {columns.map((column, index: number) => (
                                        <ThSortable
                                            key={index}
                                            onMouseOver={() => showTableTooltip(column.tooltip?.key)}
                                            onMouseLeave={() => hideTableTooltip()}
                                            label={translate(column.label)}
                                        />
                                    ))}

                                    <TableTopScrollerConfigTh
                                        showTableConfig={showTableConfig}
                                        displayTableConfig={displayTableConfig}
                                        tableConfigCategory={tableConfigCategory}
                                    />
                                </tr>
                            </thead>

                            {budgetFunds.map((fund) => (
                                <FinancialOverviewFundsBudgetTableItem key={fund.id} fund={fund} />
                            ))}

                            <tbody>
                                <tr className="table-totals">
                                    <td>{translate('financial_dashboard_overview.labels.total')}</td>
                                    <td>{financialOverview.budget_funds.vouchers_amount_locale}</td>
                                    <td>{financialOverview.budget_funds.active_vouchers_amount_locale}</td>
                                    <td>{financialOverview.budget_funds.inactive_vouchers_amount_locale}</td>
                                    <td>{financialOverview.budget_funds.deactivated_vouchers_amount_locale}</td>
                                    <td>{financialOverview.budget_funds.budget_used_active_vouchers_locale}</td>
                                    <td className={'text-right'}>
                                        {currencyFormat(
                                            parseFloat(financialOverview.budget_funds.vouchers_amount) -
                                                financialOverview.budget_funds.budget_used_active_vouchers,
                                        )}
                                    </td>
                                    <td className={'table-td-actions text-right'}>
                                        <TableEmptyValue />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            </div>
        </div>
    );
}
