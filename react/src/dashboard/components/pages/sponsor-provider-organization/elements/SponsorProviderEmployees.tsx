import React from 'react';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { useFundService } from '../../../../services/FundService';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Employee from '../../../../props/models/Employee';
import { strLimit } from '../../../../helpers/string';

export default function SponsorProviderEmployees({ employees }: { employees: Array<Employee> }) {
    const fundService = useFundService();

    const { headElement, configsElement } = useConfigurableTable(fundService.getProviderEmployeeColumns());

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Medewerkers</div>
            </div>

            {employees.length > 0 ? (
                <div className="card-section card-section-padless">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee.id}>
                                        {employee.email ? (
                                            <td>{employee.email}</td>
                                        ) : (
                                            <td>{strLimit(employee.identity_address, 32)}</td>
                                        )}
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
                <EmptyCard type={'card-section'} title={'Geen medewerkers'} />
            )}
        </div>
    );
}
