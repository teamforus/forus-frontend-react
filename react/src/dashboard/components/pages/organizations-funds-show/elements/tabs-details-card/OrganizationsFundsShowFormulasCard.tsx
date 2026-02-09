import React from 'react';
import Fund from '../../../../../props/models/Fund';
import TableDateTime from '../../../../elements/tables/elements/TableDateTime';
import { useFundService } from '../../../../../services/FundService';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import LoaderTableCard from '../../../../elements/loader-table-card/LoaderTableCard';

export default function OrganizationsFundsShowFormulasCard({ fund }: { fund: Fund }) {
    const fundService = useFundService();

    return (
        <LoaderTableCard
            empty={fund.formulas?.length == 0}
            emptyTitle={'No fund formulas'}
            columns={fundService.getFormulasColumns()}>
            {fund.formulas?.map((formula) => (
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
        </LoaderTableCard>
    );
}
