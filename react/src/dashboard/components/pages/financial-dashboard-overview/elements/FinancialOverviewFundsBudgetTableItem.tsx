import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import Fund from '../../../../props/models/Fund';
import useTranslate from '../../../../hooks/useTranslate';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import classNames from 'classnames';

export default function FinancialOverviewFundsBudgetTableItem({ fund }: { fund: Fund }) {
    const translate = useTranslate();

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
                className={classNames('tr-clickable', !collapsed && 'table-separator')}
                onClick={() => setCollapsed(!collapsed)}>
                <td>
                    <div className="flex">
                        <a
                            className={`mdi mdi-menu-down td-menu-icon ${
                                collapsed ? 'mdi-menu-down' : 'mdi-menu-right'
                            }`}
                        />
                        <strong className="nowrap">{strLimit(fund.name, 64)}</strong>
                    </div>
                </td>
                <td>{fundBudget.vouchers_amount_locale}</td>
                <td>{fundBudget.active_vouchers_amount_locale}</td>
                <td>{fundBudget.inactive_vouchers_amount_locale}</td>
                <td>{fundBudget.deactivated_vouchers_amount_locale}</td>
                <td>{fundBudget.used_active_vouchers_locale}</td>
                <td>
                    {currencyFormat(
                        parseFloat(fundBudget.vouchers_amount) - parseFloat(fundBudget.used_active_vouchers),
                    )}
                </td>

                <td className={'table-td-actions text-right'}>
                    <TableEmptyValue />
                </td>
            </tr>

            {collapsed && (
                <Fragment>
                    <tr>
                        <td style={{ paddingLeft: '46px' }}>
                            <strong>{translate('financial_dashboard_overview.labels.total_percentage')}</strong>
                        </td>
                        <td>{fundBudget.percentage_total} %</td>
                        <td>{fundBudget.percentage_active} %</td>
                        <td>{fundBudget.percentage_inactive} %</td>
                        <td>{fundBudget.percentage_deactivated} %</td>
                        <td>{fundBudget.percentage_used} %</td>
                        <td>{fundBudget.percentage_left} %</td>

                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>

                    <tr>
                        <td style={{ paddingLeft: '46px' }}>
                            <strong>{translate('financial_dashboard_overview.labels.total_count')}</strong>
                        </td>
                        <td>{fundBudget.vouchers_count}</td>
                        <td>{fundBudget.active_vouchers_count}</td>
                        <td>{fundBudget.inactive_vouchers_count}</td>
                        <td>{fundBudget.deactivated_vouchers_count}</td>
                        <td>-</td>
                        <td>-</td>

                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>

                    <tr>
                        <td style={{ paddingLeft: '46px' }}>
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

                        <td colSpan={3} className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>

                    {fundBudget.children_count > 0 && (
                        <tr>
                            <td style={{ paddingLeft: '46px' }}>
                                <strong>Persoonsgegevens</strong>
                            </td>
                            <td colSpan={6}>
                                <div>Aantal kinderen</div>
                                <div>
                                    <strong>{fundBudget.children_count}</strong>
                                </div>
                            </td>

                            <td className={'table-td-actions text-right'}>
                                <TableEmptyValue />
                            </td>
                        </tr>
                    )}

                    <tr>
                        <td style={{ paddingLeft: '46px' }}>
                            <strong>{translate('financial_dashboard_overview.labels.product_vouchers')}</strong>
                        </td>
                        <td>{fund.product_vouchers.vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.active_vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.inactive_vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.deactivated_vouchers_amount_locale}</td>

                        <td colSpan={3} className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                </Fragment>
            )}
        </tbody>
    );
}
