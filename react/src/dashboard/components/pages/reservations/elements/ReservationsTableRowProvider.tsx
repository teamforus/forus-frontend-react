import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import classNames from 'classnames';
import TableCheckboxControl from '../../../elements/tables/elements/TableCheckboxControl';
import { hasPermission } from '../../../../helpers/utils';
import { strLimit } from '../../../../helpers/string';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';
import ReservationStateLabel from '../../../elements/resource-states/ReservationStateLabel';
import TableRowActions from '../../../elements/tables/TableRowActions';
import Organization, { Permission } from '../../../../props/models/Organization';
import Reservation from '../../../../props/models/Reservation';
import useReservationsTableActions from '../hooks/useReservationsTableActions';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function ReservationsTableRowProvider({
    fetchReservations,
    reservation,
    organization,
    showExtraPayments = false,
    selected = null,
    toggle = null,
}: {
    fetchReservations: () => void;
    reservation: Reservation;
    organization: Organization;
    showExtraPayments?: boolean;
    selected?: Array<number>;
    toggle?: (e: React.MouseEvent<HTMLElement>, item: { id: number }) => void;
}) {
    const { acceptReservations, rejectReservations, archiveReservations, unarchiveReservations } =
        useReservationsTableActions(organization, fetchReservations);

    return (
        <StateNavLink
            name={DashboardRoutes.RESERVATION}
            params={{
                organizationId: organization.id,
                id: reservation.id,
            }}
            className={classNames('tr-clickable', selected?.includes(reservation.id) && 'selected')}
            dataDusk={`tableReservationRow${reservation.id}`}
            customElement={'tr'}
            key={reservation.id}>
            {toggle && (
                <td className="td-narrow">
                    <TableCheckboxControl
                        checked={selected.includes(reservation.id)}
                        onClick={(e) => toggle(e, reservation)}
                    />
                </td>
            )}

            <td>
                <StateNavLink
                    name={DashboardRoutes.RESERVATION}
                    params={{
                        organizationId: organization.id,
                        id: reservation.id,
                    }}
                    className="text-strong">{`#${reservation.code}`}</StateNavLink>
            </td>
            <td>
                <StateNavLink
                    name={DashboardRoutes.PRODUCT}
                    disabled={!hasPermission(organization, Permission.MANAGE_PRODUCTS)}
                    params={{
                        organizationId: reservation.product.organization_id,
                        id: reservation.product.id,
                    }}
                    className={classNames(
                        `text-strong text-primary`,
                        reservation.product?.deleted ? 'text-strike' : 'text-decoration-link',
                    )}
                    title={reservation.product.name}>
                    {strLimit(reservation.product.name, 45)}
                </StateNavLink>
                <div className="text-strong text-small text-muted-dark">{reservation.product?.price_locale}</div>
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

            <td className={'table-td-actions text-right'}>
                <TableRowActions
                    content={(e) => (
                        <div className="dropdown dropdown-actions">
                            <StateNavLink
                                name={DashboardRoutes.RESERVATION}
                                params={{
                                    organizationId: organization.id,
                                    id: reservation.id,
                                }}
                                className="dropdown-item">
                                <em className="mdi mdi-eye icon-start" />
                                Bekijk
                            </StateNavLink>

                            {reservation.acceptable && (
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        acceptReservations([reservation]);
                                        e.close();
                                    }}>
                                    <em className="mdi mdi-check icon-start" />
                                    Accepteren
                                </div>
                            )}

                            {reservation.rejectable && (
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        rejectReservations([reservation]);
                                        e.close();
                                    }}>
                                    <em className="mdi mdi-close icon-start" />
                                    Afwijzen
                                </div>
                            )}

                            {reservation.archivable && (
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        archiveReservations([reservation]);
                                        e.close();
                                    }}>
                                    <em className="mdi mdi-archive-outline icon-start" />
                                    Archief
                                </div>
                            )}

                            {reservation.archived && (
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        unarchiveReservations([reservation]);
                                        e.close();
                                    }}>
                                    <em className="mdi mdi-archive-arrow-up-outline icon-start" />
                                    Herstellen
                                </div>
                            )}
                        </div>
                    )}
                />
            </td>
        </StateNavLink>
    );
}
