import React, { useCallback } from 'react';
import { FundRequestLocal, FundRequestRecordLocal } from '../FundRequestsView';
import useTranslate from '../../../../hooks/useTranslate';
import Label from '../../../elements/label/Label';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import { uniq } from 'lodash';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { useFundRequestValidatorService } from '../../../../services/FundRequestValidatorService';

export default function FundRequestRecordsHasClarifications({
    fundRequest,
    setUncollapsedRecords,
    setUncollapsedRecordGroups,
}: {
    fundRequest: FundRequestLocal;
    setUncollapsedRecords: React.Dispatch<React.SetStateAction<number[]>>;
    setUncollapsedRecordGroups: React.Dispatch<React.SetStateAction<number[]>>;
}) {
    const translate = useTranslate();

    const fundRequestService = useFundRequestValidatorService();

    const { headElement, configsElement } = useConfigurableTable(
        fundRequestService.getRecordsHasClarificationsColumns(),
    );

    const scrollToItem = useCallback((id: string, delay: number = 100) => {
        setTimeout(() => {
            const el = document.getElementById(id);

            if (!el) {
                return;
            }

            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, delay);
    }, []);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    {translate('validation_requests.labels.records_has_clarifications')} (
                    {fundRequest.record_has_clarifications.length})
                </div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-table card-block-request-record">
                    {configsElement}

                    <TableTopScroller>
                        <table className="table">
                            {headElement}

                            <tbody>
                                {fundRequest.record_has_clarifications.map((record: FundRequestRecordLocal) => (
                                    <tr
                                        className="tr-clickable"
                                        key={record.id}
                                        onClick={() => {
                                            setUncollapsedRecordGroups((groups) => uniq([...groups, record.group_id]));
                                            setUncollapsedRecords((records) => uniq([...records, record.id]));
                                            scrollToItem(`recordRow${record.id}`, 100);
                                        }}>
                                        <td>{record.record_type.name}</td>

                                        {record?.record_type.type != 'select' && (
                                            <td className={record.value !== null ? 'text-muted' : ''}>
                                                {record?.value || 'Niet beschikbaar'}
                                            </td>
                                        )}

                                        {record?.record_type.type == 'select' && (
                                            <td className={record.value !== null ? 'text-muted' : ''}>
                                                {record?.record_type.options?.find(
                                                    (option) => option.value == record?.value,
                                                )?.name || 'Niet beschikbaar'}
                                            </td>
                                        )}

                                        <td>{translate(`validation_requests.sources.${record.source}`)}</td>

                                        <td>
                                            <Label
                                                type={
                                                    record.clarifications[record.clarifications.length - 1].state ==
                                                    'pending'
                                                        ? 'default'
                                                        : 'success'
                                                }>
                                                {translate(
                                                    `validation_requests.clarification_states.${record.clarifications[record.clarifications.length - 1].state}`,
                                                )}
                                            </Label>
                                        </td>

                                        <td className="td-narrow text-right"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableTopScroller>
                </div>
            </div>
        </div>
    );
}
