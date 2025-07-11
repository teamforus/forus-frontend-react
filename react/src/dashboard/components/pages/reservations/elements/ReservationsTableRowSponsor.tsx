import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import { strLimit } from '../../../../helpers/string';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';
import ReservationStateLabel from '../../../elements/resource-states/ReservationStateLabel';
import TableRowActions from '../../../elements/tables/TableRowActions';
import Reservation from '../../../../props/models/Reservation';
import Organization from '../../../../props/models/Organization';
import TransactionStateLabel from '../../../elements/resource-states/TransactionStateLabel';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TruncatedMultilineText from '../../../elements/truncated-multiline-text/TruncatedMultilineText';

export default function ReservationsTableRowSponsor({
    organization,
    reservation,
    showExtraPayments = false,
    selected = null,
    toggle = null,
}: {
    organization: Organization;
    reservation: Reservation;
    showExtraPayments?: boolean;
    selected?: Array<number>;
    toggle?: (e: React.MouseEvent<HTMLElement>, item: { id: number }) => void;
}) {
    return (
        <tr>
            {toggle && (
                <td className="td-narrow">
                    <TableCheckboxControl
                        checked={selected.includes(reservation.id)}
                        onClick={(e) => toggle(e, reservation)}
                    />
                </td>
            )}

            <td>
                <span className="text-strong">{`#${reservation.code}`}</span>
            </td>
            <td>
                <StateNavLink
                    name={'sponsor-product'}
                    params={{
                        organizationId: organization.id,
                        productId: reservation.product.id,
                    }}
                    className="text-strong text-primary text-decoration-link">
                    {strLimit(reservation.product.name, 45)}
                </StateNavLink>
                <div className="text-strong text-small text-muted-dark">{reservation.product?.price_locale}</div>
            </td>

            <td>
                <StateNavLink
                    name={'sponsor-provider-organization'}
                    params={{
                        id: reservation.product.organization_id,
                        organizationId: organization.id,
                    }}
                    className="text-strong text-primary text-decoration-link"
                    title={reservation.product.organization.name}>
                    <TruncatedMultilineText
                        text={reservation.product.organization.name}
                        maxLines={2}
                        maxSymbolsPerLine={32}
                    />
                </StateNavLink>
            </td>
            <td>{reservation.amount_locale}</td>

            {showExtraPayments && <td>{reservation.amount_extra ? reservation.amount_extra_locale : '-'}</td>}

            <td>
                <div className={'flex flex-vertical'}>
                    {reservation.identity_physical_card ? (
                        <div className={'flex flex-vertical'}>
                            <div className="text-strong text-primary">{reservation.identity_physical_card}</div>
                            <BlockInlineCopy
                                className="text-strong text-small text-muted-dark"
                                value={reservation.identity_email}>
                                {strLimit(reservation.identity_email, 27)}
                            </BlockInlineCopy>
                        </div>
                    ) : (
                        <BlockInlineCopy className={'text-strong text-primary'} value={reservation.identity_email}>
                            {strLimit(reservation.identity_email, 27)}
                        </BlockInlineCopy>
                    )}
                    {(reservation.first_name || reservation.last_name) && (
                        <strong>{reservation.first_name + ' ' + reservation.last_name}</strong>
                    )}
                </div>
            </td>
            <td>
                <strong className="text-primary">{reservation.created_at_locale}</strong>
            </td>
            <td data-dusk="reservationState">
                <ReservationStateLabel reservation={reservation} />
            </td>
            <td>
                {reservation.voucher_transaction ? (
                    <StateNavLink
                        name="transaction"
                        params={{
                            organizationId: organization.id,
                            address: reservation.voucher_transaction.address,
                        }}
                        className="text-strong text-primary text-decoration-link"
                        title={reservation.product.organization.name}>
                        {reservation.voucher_transaction.id.toString()}
                    </StateNavLink>
                ) : (
                    <TableEmptyValue />
                )}
            </td>
            <td data-dusk="transactionState">
                {reservation.voucher_transaction ? (
                    <TransactionStateLabel transaction={reservation.voucher_transaction} />
                ) : (
                    <TableEmptyValue />
                )}
            </td>
            <td className={'table-td-actions text-right'}>
                {reservation.voucher_transaction ? (
                    <TableRowActions
                        content={() => (
                            <div className="dropdown dropdown-actions">
                                <StateNavLink
                                    name="transaction"
                                    params={{
                                        organizationId: organization.id,
                                        address: reservation.voucher_transaction.address,
                                    }}
                                    className="dropdown-item">
                                    <em className="mdi mdi-eye icon-start" />
                                    Bekijk transactie
                                </StateNavLink>
                            </div>
                        )}
                    />
                ) : (
                    <TableEmptyValue />
                )}
            </td>
        </tr>
    );
}
