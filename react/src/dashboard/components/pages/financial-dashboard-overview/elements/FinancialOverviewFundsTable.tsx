import React from 'react';
import ThSortable from '../../../elements/tables/ThSortable';
import Tooltip from '../../../elements/tooltip/Tooltip';
import Fund from '../../../../props/models/Fund';
import useExportFunds from '../hooks/useExportFunds';
import Organization from '../../../../props/models/Organization';
import { FinancialOverview } from '../../financial-dashboard/types/FinancialStatisticTypes';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import { strLimit } from '../../../../helpers/string';
import { useFundService } from '../../../../services/FundService';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableTopScrollerConfigTh from '../../../elements/tables/TableTopScrollerConfigTh';

export default function FinancialOverviewFundsTable({
    funds,
    organization,
    fundsFinancialOverview,
}: {
    funds: Array<Fund>;
    organization: Organization;
    fundsFinancialOverview: FinancialOverview;
}) {
    const translate = useTranslate();
    const exportFunds = useExportFunds(organization);

    const fundService = useFundService();

    const {
        columns,
        configsElement,
        showTableTooltip,
        hideTableTooltip,
        tableConfigCategory,
        showTableConfig,
        displayTableConfig,
    } = useConfigurableTable(fundService.getColumnsBalance());

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
                        <button className="button button-primary button-sm" onClick={() => exportFunds(false)}>
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
                            <tbody>
                                {funds.map((fund) => (
                                    <tr key={fund.id}>
                                        <td title={fund.name}>{strLimit(fund.name, 64)}</td>
                                        <td>{fund.budget?.total_locale || <TableEmptyValue />}</td>
                                        <td>{fund.budget?.used_locale || <TableEmptyValue />}</td>
                                        <td>{fund.budget?.left_locale || <TableEmptyValue />}</td>
                                        <td className={'text-right'}>{fund.budget?.transaction_costs_locale}</td>
                                        <td className={'table-td-actions text-right'}>
                                            <TableEmptyValue />
                                        </td>
                                    </tr>
                                ))}

                                <tr className="table-totals">
                                    <td>{translate('financial_dashboard_overview.labels.total')}</td>
                                    <td>{fundsFinancialOverview.funds.budget_locale}</td>
                                    <td>{fundsFinancialOverview.funds.budget_used_locale}</td>
                                    <td>{fundsFinancialOverview.funds.budget_left_locale}</td>
                                    <td className={'text-right'}>
                                        {fundsFinancialOverview.funds.transaction_costs_locale}
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
