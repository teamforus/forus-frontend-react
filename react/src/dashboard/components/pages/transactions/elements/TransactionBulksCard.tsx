import React from 'react';
import TableTopScroller from '../../../elements/tables/TableTopScroller';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TransactionBulk from '../../../../props/models/TransactionBulk';
import Label from '../../../elements/image_cropper/Label';
import TableRowActions from '../../../elements/tables/TableRowActions';
import Organization from '../../../../props/models/Organization';
import { FilterModel, FilterScope } from '../../../../modules/filter_next/types/FilterParams';
import useTransactionBulkService from '../../../../services/TransactionBulkService';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function TransactionBulksCard({
    bulks,
    filter,
    organization,
}: {
    bulks: Array<TransactionBulk>;
    filter: FilterScope<FilterModel>;
    organization: Organization;
}) {
    const transactionBulkService = useTransactionBulkService();

    const { headElement, configsElement } = useConfigurableTable(transactionBulkService.getColumns(), {
        filter,
        sortable: true,
    });

    return (
        <div className="card-section">
            <div className="card-block card-block-table">
                {configsElement}

                <TableTopScroller>
                    <table className="table">
                        {headElement}

                        <tbody>
                            {bulks?.map((transactionBulk) => (
                                <StateNavLink
                                    customElement={'tr'}
                                    className={'tr-clickable'}
                                    name={DashboardRoutes.TRANSACTION_BULK}
                                    params={{
                                        organizationId: organization.id,
                                        id: transactionBulk.id,
                                    }}
                                    key={transactionBulk.id}
                                    dataDusk={`transactionBulkRow${transactionBulk.id}`}>
                                    <td>{transactionBulk.id}</td>
                                    <td className="text-primary-light">
                                        {transactionBulk.voucher_transactions_amount_locale}
                                    </td>
                                    <td>
                                        <div className="text-semibold text-primary">
                                            {transactionBulk.created_at_locale.split(' - ')[0]}
                                        </div>
                                        <div className="text-strong text-md text-muted-dark">
                                            {transactionBulk.created_at_locale.split(' - ')[1]}
                                        </div>
                                    </td>
                                    <td>{transactionBulk.voucher_transactions_count}</td>
                                    <td>
                                        {transactionBulk.state === 'rejected' && (
                                            <Label type="danger">{transactionBulk.state_locale}</Label>
                                        )}

                                        {transactionBulk.state === 'error' && (
                                            <Label type="danger">{transactionBulk.state_locale}</Label>
                                        )}

                                        {transactionBulk.state === 'draft' && (
                                            <Label type="default">{transactionBulk.state_locale}</Label>
                                        )}

                                        {transactionBulk.state === 'accepted' && (
                                            <Label type="success">{transactionBulk.state_locale}</Label>
                                        )}

                                        {transactionBulk.state === 'pending' && (
                                            <Label type="default">{transactionBulk.state_locale}</Label>
                                        )}
                                    </td>

                                    <td className={'table-td-actions text-right'}>
                                        <TableRowActions
                                            content={() => (
                                                <div className="dropdown dropdown-actions">
                                                    <StateNavLink
                                                        className="dropdown-item"
                                                        name={DashboardRoutes.TRANSACTION_BULK}
                                                        params={{
                                                            organizationId: organization.id,
                                                            id: transactionBulk.id,
                                                        }}>
                                                        <em className={'mdi mdi-eye icon-start'} />
                                                        Bekijken
                                                    </StateNavLink>
                                                </div>
                                            )}
                                        />
                                    </td>
                                </StateNavLink>
                            ))}
                        </tbody>
                    </table>
                </TableTopScroller>
            </div>
        </div>
    );
}
