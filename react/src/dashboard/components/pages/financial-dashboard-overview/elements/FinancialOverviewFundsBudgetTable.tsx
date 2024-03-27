import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ThSortable from '../../../elements/tables/ThSortable';
import { currencyFormat } from '../../../../helpers/string';
import Tooltip from '../../../elements/tooltip/Tooltip';
import FinancialOverviewFundsBudgetTableItem from './FinancialOverviewFundsBudgetTableItem';
import FinancialOverview from '../../../../services/types/FinancialOverview';
import useExportFunds from '../hooks/useExportFunds';
import Fund from '../../../../props/models/Fund';
import Organization from '../../../../props/models/Organization';

export default function FinancialOverviewFundsBudgetTable({
    funds,
    organization,
    financialOverview,
}: {
    funds: Array<Fund>;
    organization: Organization;
    financialOverview: FinancialOverview;
}) {
    const { t } = useTranslation();

    const exportFunds = useExportFunds(organization);
    const [budgetFunds, setBudgetFunds] = useState<Array<Fund>>(null);

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
                            {t('financial_dashboard_overview.buttons.export')}
                        </button>
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
                                        label={t('financial_dashboard_overview.labels.fund_name')}
                                    />
                                    <ThSortable
                                        className="w-10"
                                        label={t('financial_dashboard_overview.labels.total')}
                                    />
                                    <ThSortable
                                        className="w-15"
                                        label={t('financial_dashboard_overview.labels.active')}
                                    />
                                    <ThSortable
                                        className="w-15"
                                        label={t('financial_dashboard_overview.labels.inactive')}
                                    />
                                    <ThSortable
                                        className="w-15"
                                        label={t('financial_dashboard_overview.labels.deactivated')}
                                    />
                                    <ThSortable
                                        className="w-15"
                                        label={t('financial_dashboard_overview.labels.used')}
                                    />
                                    <ThSortable
                                        className={'text-right'}
                                        label={t('financial_dashboard_overview.labels.left')}
                                    />
                                </tr>
                            </thead>

                            {budgetFunds.map((fund) => (
                                <FinancialOverviewFundsBudgetTableItem key={fund.id} fund={fund} />
                            ))}

                            <tbody>
                                <tr className="table-totals">
                                    <td>{t('financial_dashboard_overview.labels.total')}</td>
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
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
