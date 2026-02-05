import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import React, { Fragment } from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import { useFundRequestValidatorService } from '../../../../../services/FundRequestValidatorService';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import LoaderTableCard from '../../../../elements/loader-table-card/LoaderTableCard';

export default function FundRequestRecordHistoryTab({ record }: { record: FundRequestRecord }) {
    const translate = useTranslate();
    const fundRequestService = useFundRequestValidatorService();

    return (
        <div className="card" data-dusk="historyTabContent">
            <div className="card-header">
                <div className="card-title">
                    {translate('validation_request_details.labels.history', { count: record.history.length })}
                </div>
            </div>
            <LoaderTableCard
                empty={record.history.length == 0}
                emptyTitle={'Geen historie.'}
                columns={fundRequestService.getRecordChangesColumns()}>
                {record.history?.map((log) => (
                    <tr key={log.id} data-dusk={`recordHistoryRow${log.id}`} className="light">
                        {record?.record_type.type != 'select' && (
                            <Fragment>
                                <td className="text-strong">{log.new_value}</td>
                                <td className="text-muted">{log.old_value}</td>
                            </Fragment>
                        )}

                        {record?.record_type.type == 'select' && (
                            <Fragment>
                                <td className="text-strong">
                                    {record?.record_type.options?.find((option) => option.value == log.new_value)
                                        ?.name || 'Niet beschikbaar'}
                                </td>
                                <td className="text-muted">
                                    {record?.record_type.options?.find((option) => option.value == log.old_value)
                                        ?.name || 'Niet beschikbaar'}
                                </td>
                            </Fragment>
                        )}
                        <td className="text-strong">{log.employee_email}</td>
                        <td>
                            <strong className="text-primary">{log.created_at_locale}</strong>
                        </td>
                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
