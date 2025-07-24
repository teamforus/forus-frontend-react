import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import React, { Fragment } from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import useConfigurableTable from '../../../vouchers/hooks/useConfigurableTable';
import { useFundRequestValidatorService } from '../../../../../services/FundRequestValidatorService';
import TableTopScroller from '../../../../elements/tables/TableTopScroller';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';

export default function FundRequestRecordHistoryTab({ record }: { record: FundRequestRecord }) {
    const translate = useTranslate();
    const fundRequestService = useFundRequestValidatorService();

    const { headElement, configsElement } = useConfigurableTable(fundRequestService.getRecordChangesColumns());

    return (
        <div className="card" data-dusk="historyTabContent">
            <div className="card-header">
                <div className="card-title">
                    {translate('validation_request_details.labels.history', { count: record.history.length })}
                </div>
            </div>
            <div className="card-section">
                <div className="card-block card-block-table">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table table-fixed">
                            {headElement}

                            <tbody>
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
                                                    {record?.record_type.options?.find(
                                                        (option) => option.value == log.new_value,
                                                    )?.name || 'Niet beschikbaar'}
                                                </td>
                                                <td className="text-muted">
                                                    {record?.record_type.options?.find(
                                                        (option) => option.value == log.old_value,
                                                    )?.name || 'Niet beschikbaar'}
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
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            </div>

            {record.history.length == 0 && (
                <div className="card-section">
                    <div className="card-subtitle text-center">Geen historie.</div>
                </div>
            )}
        </div>
    );
}
