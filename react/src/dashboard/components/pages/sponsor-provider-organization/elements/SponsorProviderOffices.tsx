import React from 'react';
import classNames from 'classnames';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { useFundService } from '../../../../services/FundService';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import Office from '../../../../props/models/Office';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function SponsorProviderOffices({ offices }: { offices: Array<Office> }) {
    const fundService = useFundService();

    const { headElement, configsElement } = useConfigurableTable(fundService.getProviderOfficeColumns());

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Vestigingen</div>
            </div>

            {offices.length > 0 ? (
                <div className="card-section card-section-padless">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {offices.map((office) => (
                                    <tr key={office.id}>
                                        <td className={classNames(!office.address && 'text-muted')}>
                                            {office.address || 'n.v.t.'}
                                        </td>
                                        <td className={classNames(!office.phone && 'text-muted')}>
                                            {office.phone || 'n.v.t.'}
                                        </td>
                                        <td className={'table-td-actions text-right'}>
                                            <TableEmptyValue />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            ) : (
                <EmptyCard type={'card-section'} title={'Geen vestigingen'} />
            )}
        </div>
    );
}
