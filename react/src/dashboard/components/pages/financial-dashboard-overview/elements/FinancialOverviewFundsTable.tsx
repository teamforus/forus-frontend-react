import React from 'react';
import { useTranslation } from 'react-i18next';
import ThSortable from '../../../elements/tables/ThSortable';
import Tooltip from '../../../elements/tooltip/Tooltip';
import Fund from '../../../../props/models/Fund';
import FinancialOverview from '../../../../services/types/FinancialOverview';
import useExportFunds from '../hooks/useExportFunds';
import Organization from '../../../../props/models/Organization';

export default function FinancialOverviewFundsTable({
    funds,
    organization,
    fundsFinancialOverview,
}: {
    funds: Array<Fund>;
    organization: Organization;
    fundsFinancialOverview: FinancialOverview;
}) {
    const { t } = useTranslation();
    const exportFunds = useExportFunds(organization);

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
                            {t('financial_dashboard_overview.buttons.export')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-table card-block-financial">
                    <div className="table-wrapper">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <ThSortable label={t('financial_dashboard_overview.labels.fund_name')} />
                                    <ThSortable label={t('financial_dashboard_overview.labels.total_budget')} />
                                    <ThSortable label={t('financial_dashboard_overview.labels.used_budget')} />
                                    <ThSortable label={t('financial_dashboard_overview.labels.current_budget')} />
                                    <ThSortable
                                        className={'text-right'}
                                        label={t('financial_dashboard_overview.labels.transaction_costs')}
                                    />
                                </tr>

                                {funds.map((fund) => (
                                    <tr key={fund.id}>
                                        <td>{fund.name}</td>
                                        <td>{fund.budget.total_locale}</td>
                                        <td>{fund.budget.used_locale}</td>
                                        <td>{fund.budget.left_locale}</td>
                                        <td className={'text-right'}>{fund.budget.transaction_costs_locale}</td>
                                    </tr>
                                ))}

                                <tr className="table-totals">
                                    <td>{t('financial_dashboard_overview.labels.total')}</td>
                                    <td>{fundsFinancialOverview.funds.budget_locale}</td>
                                    <td>{fundsFinancialOverview.funds.budget_used_locale}</td>
                                    <td>{fundsFinancialOverview.funds.budget_left_locale}</td>
                                    <td className={'text-right'}>
                                        {fundsFinancialOverview.funds.transaction_costs_locale}
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
