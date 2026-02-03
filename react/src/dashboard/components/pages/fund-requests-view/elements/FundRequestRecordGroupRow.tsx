import React, { Fragment } from 'react';
import classNames from 'classnames';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import { FundRequestLocal, FundRequestRecordGroupLocal, FundRequestRecordLocal } from '../FundRequestsView';
import Organization from '../../../../props/models/Organization';
import FundRequestRecordRow from './FundRequestRecordRow';
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
        trPrepend: <Fragment>{group?.hasContent && <th className="cell-chevron th-narrow" />}</Fragment>,
    });

    return (
        <tbody data-dusk={`tableFundRequestRecordGroupRow${group.id}`}>
            <tr>
                <td className="cell-chevron">
                    <a
                        className={classNames(
                            'mdi',
                            'td-menu-icon',
                            uncollapsedRecordGroups.includes(group.id) ? 'mdi-menu-up' : 'mdi-menu-down',
                        )}
                        onClick={() => {
                            setUncollapsedRecordGroups((groups) => {
                                return groups?.includes(group.id)
                                    ? groups?.filter((id) => id !== group.id)
                                    : [...groups, group.id];
                            });
                        }}
                    />
                </td>
                <td className="text-semibold text-lg">
                    {group.title} ({group.records.length})
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
                                        <FundRequestRecordRow
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
        </tbody>
    );
}
