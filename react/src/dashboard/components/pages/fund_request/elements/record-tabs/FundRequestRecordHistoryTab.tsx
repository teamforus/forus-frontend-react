import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import { useTranslation } from 'react-i18next';
import React from 'react';

export default function FundRequestRecordHistoryTab({ fundRequestRecord }: { fundRequestRecord: FundRequestRecord }) {
    const { t } = useTranslation();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title pull-left">
                    {t('validation_request_details.labels.history', { count: fundRequestRecord.history.length })}
                </div>
            </div>
            <div className="card-section">
                <div className="card-block card-block-table">
                    <div className="table-wrapper">
                        <table className="table table-fixed">
                            <tbody>
                                <tr>
                                    <th>{t('validation_request_details.labels.new_value')}</th>
                                    <th>{t('validation_request_details.labels.old_value')}</th>
                                    <th>{t('validation_request_details.labels.employee')}</th>
                                    <th className="text-right">
                                        {t('validation_request_details.labels.date_changed')}
                                    </th>
                                </tr>
                                {fundRequestRecord.history?.map((log) => (
                                    <tr key={log.id} className="light">
                                        <td className="text-strong">{log.new_value}</td>
                                        <td className="text-muted">{log.old_value}</td>
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

            {fundRequestRecord.history.length == 0 && (
                <div className="card-section">
                    <div className="card-subtitle text-center">Geen historie.</div>
                </div>
            )}
        </div>
    );
}
