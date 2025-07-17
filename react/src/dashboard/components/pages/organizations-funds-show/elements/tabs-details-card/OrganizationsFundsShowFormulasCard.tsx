import React from 'react';
import Fund from '../../../../../props/models/Fund';
import EmptyCard from '../../../../elements/empty-card/EmptyCard';
import TableDateTime from '../../../../elements/tables/elements/TableDateTime';
import TableTopScroller from '../../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../../vouchers/hooks/useConfigurableTable';
import { useFundService } from '../../../../../services/FundService';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';

export default function OrganizationsFundsShowFormulasCard({ fund }: { fund: Fund }) {
    const fundService = useFundService();

    const { headElement, configsElement } = useConfigurableTable(fundService.getFormulasColumns());

    return (
        <div className="card-section">
            <div className="card-block card-block-table">
                {configsElement}

                <TableTopScroller>
                    {fund.formulas?.length > 0 ? (
                        <table className="table">
                            {headElement}

                            <tbody>
                                {fund.formulas.map((formula) => (
                                    <tr key={formula.id}>
                                        <td>{formula.id}</td>
                                        <td>{formula.type}</td>
                                        <td>{formula.amount_locale}</td>
                                        <td>{formula.record_type_name || '-'}</td>
                                        <td>
                                            <TableDateTime value={formula.created_at_locale} />
                                        </td>
                                        <td>
                                            <TableDateTime value={formula.updated_at_locale} />
                                        </td>
                                        <td className={'table-td-actions text-right'}>
                                            <TableEmptyValue />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyCard title={'No fund formulas'} />
                    )}
                </TableTopScroller>
            </div>
        </div>
    );
}
