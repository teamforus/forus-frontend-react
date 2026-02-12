import React, { Fragment } from 'react';
import classNames from 'classnames';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import { FundRequestLocal, FundRequestRecordGroupLocal, FundRequestRecordLocal } from '../FundRequestsView';
import Organization from '../../../../props/models/Organization';
import FundRequestGroupRecordRow from './FundRequestGroupRecordRow';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { useFundRequestValidatorService } from '../../../../services/FundRequestValidatorService';

export default function FundRequestRecordGroupRow({
    organization,
    group,
    fundRequest,
    uncollapsedRecords,
    setUncollapsedRecords,
    uncollapsedRecordGroups,
    setUncollapsedRecordGroups,
    reloadRequest,
}: {
    organization: Organization;
    group: FundRequestRecordGroupLocal;
    fundRequest: FundRequestLocal;
    uncollapsedRecordGroups: Array<number>;
    setUncollapsedRecordGroups: React.Dispatch<React.SetStateAction<number[]>>;
    uncollapsedRecords: Array<number>;
    setUncollapsedRecords: React.Dispatch<React.SetStateAction<number[]>>;
    reloadRequest: () => void;
}) {
    const fundRequestService = useFundRequestValidatorService();

    const { headElement, configsElement } = useConfigurableTable(fundRequestService.getRecordsColumns(), {
        trPrepend: <Fragment>{group?.hasContent && <th className="th-narrow" />}</Fragment>,
    });

    return (
        <Fragment>
            <tr
                className="tr-clickable"
                data-dusk={`tableFundRequestRecordGroupRow${group.id}`}
                onClick={() => {
                    setUncollapsedRecordGroups((groups) => {
                        return groups?.includes(group.id)
                            ? groups?.filter((id) => id !== group.id)
                            : [...groups, group.id];
                    });
                }}>
                <td>
                    <div className="td-collapsable td-collapsable-lg">
                        <div className="collapsable-icon">
                            <div
                                className={classNames(
                                    'mdi',
                                    'icon-collapse',
                                    uncollapsedRecordGroups.includes(group.id) ? 'mdi-menu-down' : 'mdi-menu-right',
                                )}
                            />
                        </div>

                        <div className="collapsable-content text-semibold">
                            {group.title} ({group.records.length})
                        </div>
                    </div>
                </td>
                <td className="td-narrow text-right">
                    <TableEmptyValue />
                </td>
            </tr>

            {uncollapsedRecordGroups.includes(group.id) && (
                <tr>
                    <td className="td-paddless relative" colSpan={3}>
                        {configsElement}

                        <table className="table table-embed">
                            {headElement}

                            <tbody>
                                <Fragment>
                                    {group.records.map((record: FundRequestRecordLocal) => (
                                        <FundRequestGroupRecordRow
                                            key={record.id}
                                            organization={organization}
                                            record={record}
                                            group={group}
                                            fundRequest={fundRequest}
                                            uncollapsedRecords={uncollapsedRecords}
                                            setUncollapsedRecords={setUncollapsedRecords}
                                            reloadRequest={reloadRequest}
                                        />
                                    ))}
                                </Fragment>
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
