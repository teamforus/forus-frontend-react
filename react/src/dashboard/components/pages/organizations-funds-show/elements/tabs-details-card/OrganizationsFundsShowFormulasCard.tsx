import React from 'react';
import Fund from '../../../../../props/models/Fund';
import EmptyCard from '../../../../elements/empty-card/EmptyCard';
import TableDateTime from '../../../../elements/tables/elements/TableDateTime';

export default function OrganizationsFundsShowFormulasCard({ fund }: { fund: Fund }) {
    return (
        <div className="card-section">
            <div className="card-block card-block-table">
                <div className="table-wrapper">
                    {fund.formulas?.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Type</th>
                                    <th>Bedrag</th>
                                    <th>Gegeven</th>
                                    <th>Aangemaakt op</th>
                                    <th className="text-right">Laatste aanpassing</th>
                                </tr>
                            </thead>

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
                                        <td className="text-right">
                                            <TableDateTime value={formula.updated_at_locale} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyCard title={'No fund formulas'} />
                    )}
                </div>
            </div>
        </div>
    );
}
