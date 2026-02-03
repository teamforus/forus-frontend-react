import React from 'react';
import classNames from 'classnames';
import { useFundService } from '../../../../services/FundService';
import Office from '../../../../props/models/Office';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

export default function SponsorProviderOffices({ offices }: { offices: Array<Office> }) {
    const fundService = useFundService();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Vestigingen</div>
            </div>

            <LoaderTableCard
                empty={offices.length === 0}
                emptyTitle={'Geen vestigingen'}
                columns={fundService.getProviderOfficeColumns()}>
                {offices.map((office) => (
                    <tr key={office.id}>
                        <td className={classNames(!office.address && 'text-muted')}>{office.address || 'n.v.t.'}</td>
                        <td className={classNames(!office.phone && 'text-muted')}>{office.phone || 'n.v.t.'}</td>
                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
