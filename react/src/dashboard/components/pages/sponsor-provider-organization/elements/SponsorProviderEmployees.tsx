import React from 'react';
import { useFundService } from '../../../../services/FundService';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Employee from '../../../../props/models/Employee';
import { strLimit } from '../../../../helpers/string';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';

export default function SponsorProviderEmployees({ employees }: { employees: Array<Employee> }) {
    const fundService = useFundService();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Medewerkers</div>
            </div>

            <LoaderTableCard
                empty={employees.length === 0}
                emptyTitle={'Geen medewerkers'}
                columns={fundService.getProviderEmployeeColumns()}>
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
            </LoaderTableCard>
        </div>
    );
}
