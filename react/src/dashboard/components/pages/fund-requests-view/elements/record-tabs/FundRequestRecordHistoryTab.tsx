import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import React, { Fragment } from 'react';
import useTranslate from '../../../../../hooks/useTranslate';

export default function FundRequestRecordHistoryTab({ record }: { record: FundRequestRecord }) {
    const translate = useTranslate();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title pull-left">
                    {translate('validation_request_details.labels.history', { count: record.history.length })}
                </div>
            </div>
            <div className="card-section">
                <div className="card-block card-block-table">
                    <div className="table-wrapper">
                        <table className="table table-fixed">
                            <tbody>
                                <tr>
                                    <th>{translate('validation_request_details.labels.new_value')}</th>
                                    <th>{translate('validation_request_details.labels.old_value')}</th>
                                    <th>{translate('validation_request_details.labels.employee')}</th>
                                    <th className="text-right">
                                        {translate('validation_request_details.labels.date_changed')}
                                    </th>
                                </tr>
                                {record.history?.map((log) => (
                                    <tr key={log.id} className="light">
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
                                        <td className="text-right">
                                            <strong className="text-primary">{log.created_at_locale}</strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
