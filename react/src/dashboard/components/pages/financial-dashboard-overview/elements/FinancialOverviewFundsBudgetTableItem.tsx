import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import Fund from '../../../../props/models/Fund';

export default function FinancialOverviewFundsBudgetTableItem({ fund }: { fund: Fund }) {
    const { t } = useTranslation();

    const [collapsed, setCollapsed] = useState(false);

    const divide = useCallback((value: number, from: number, _default = 0) => {
        return from ? value / from : _default;
    }, []);

    const getPercentage = useCallback(
        (value: number, from: number) => (divide(value, from) * 100).toFixed(2),
        [divide],
    );

    const fundBudget = useMemo(
        () => ({
            ...fund.budget,
            percentage_total: '100.00',
            percentage_active: getPercentage(
                parseFloat(fund.budget.active_vouchers_amount),
                parseFloat(fund.budget.vouchers_amount),
            ),
            percentage_inactive: getPercentage(
                parseFloat(fund.budget.inactive_vouchers_amount),
                parseFloat(fund.budget.vouchers_amount),
            ),
            percentage_deactivated: getPercentage(
                parseFloat(fund.budget.deactivated_vouchers_amount),
                parseFloat(fund.budget.vouchers_amount),
            ),
            percentage_used: getPercentage(
                parseFloat(fund.budget.used_active_vouchers),
                parseFloat(fund.budget.vouchers_amount),
            ),
            percentage_left: getPercentage(
                parseFloat(fund.budget.vouchers_amount) - parseFloat(fund.budget.used_active_vouchers),
                parseFloat(fund.budget.vouchers_amount),
            ),
            average_per_voucher: currencyFormat(
                divide(parseFloat(fund.budget.vouchers_amount), fund.budget.vouchers_count),
            ),
        }),
        [divide, getPercentage, fund],
    );

    return (
        <tbody>
            <tr
                className={`cursor-pointer ${collapsed ? 'table-highlight' : 'table-separator'}`}
                onClick={() => setCollapsed(!collapsed)}>
                <td>
                    <div className="flex">
                        <a
                            className={`mdi mdi-menu-down td-menu-icon ${
                                collapsed ? 'mdi-menu-down' : 'mdi-menu-right'
                            }`}
                        />
                        <strong className="nowrap">{strLimit(fund.name, 50)}</strong>
                    </div>
                </td>
                <td>{fundBudget.vouchers_amount_locale}</td>
                <td>{fundBudget.active_vouchers_amount_locale}</td>
                <td>{fundBudget.inactive_vouchers_amount_locale}</td>
                <td>{fundBudget.deactivated_vouchers_amount_locale}</td>
                <td>{fundBudget.used_active_vouchers_locale}</td>
                <td className={'text-right'}>
                    {currencyFormat(
                        parseFloat(fundBudget.vouchers_amount) - parseFloat(fundBudget.used_active_vouchers),
                    )}
                </td>
            </tr>

            {collapsed && (
                <Fragment>
                    <tr className="table-highlight-grey">
                        <td>
                            <strong>{t('financial_dashboard_overview.labels.total_percentage')}</strong>
                        </td>
                        <td>{fundBudget.percentage_total} %</td>
                        <td>{fundBudget.percentage_active} %</td>
                        <td>{fundBudget.percentage_inactive} %</td>
                        <td>{fundBudget.percentage_deactivated} %</td>
                        <td>{fundBudget.percentage_used} %</td>
                        <td className={'text-right'}>{fundBudget.percentage_left} %</td>
                    </tr>

                    <tr className="table-highlight-grey">
                        <td>
                            <strong>{t('financial_dashboard_overview.labels.total_count')}</strong>
                        </td>
                        <td>{fundBudget.vouchers_count}</td>
                        <td>{fundBudget.active_vouchers_count}</td>
                        <td>{fundBudget.inactive_vouchers_count}</td>
                        <td>{fundBudget.deactivated_vouchers_count}</td>
                        <td>-</td>
                        <td className={'text-right'}>-</td>
                    </tr>

                    <tr className="table-highlight-grey">
                        <td>
                            <strong>Tegoeden</strong>
                        </td>
                        <td colSpan={2}>
                            {fund.formulas.map((formula, index) => (
                                <div key={index}>
                                    <div>Per tegoed</div>
                                    <div>
                                        <strong>{currencyFormat(parseFloat(formula.amount))}</strong>
                                    </div>
                                </div>
                            ))}
                        </td>
                        <td>
                            <div>Gem. per tegoed</div>
                            <div>
                                <strong>{fundBudget.average_per_voucher}</strong>
                            </div>
                        </td>
                        <td />
                        <td colSpan={2} />
                    </tr>

                    {fundBudget.children_count > 0 && (
                        <tr className="table-highlight-grey">
                            <td>
                                <strong>Eigenschappen</strong>
                            </td>
                            <td colSpan={6}>
                                <div>Aantal kinderen</div>
                                <div>
                                    <strong>{fundBudget.children_count}</strong>
                                </div>
                            </td>
                        </tr>
                    )}

                    <tr className="table-highlight-grey">
                        <td>
                            <strong>{t('financial_dashboard_overview.labels.product_vouchers')}</strong>
                        </td>
                        <td>{fund.product_vouchers.vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.active_vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.inactive_vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.deactivated_vouchers_amount_locale}</td>
                        <td colSpan={2} />
                    </tr>
                </Fragment>
            )}
        </tbody>
    );
}
