import React, { Fragment, useMemo, useState } from 'react';
import Reservation from '../../../../../dashboard/props/models/Reservation';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useComposeStateAndExpires from '../hooks/useComposeStateAndExpires';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import usePayReservationExtra from '../hooks/usePayReservationExtra';
import useCancelReservation from '../hooks/useCancelReservation';

export default function ReservationCard({
    reservation,
    onDelete = null,
}: {
    reservation: Reservation;
    onDelete?: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const composeStateAndExpires = useComposeStateAndExpires();

    const [showExtraDetails, setShowExtraDetails] = useState(false);

    const cancelReservation = useCancelReservation(onDelete);
    const payReservationExtra = usePayReservationExtra();

    const stateData = useMemo(() => {
        return reservation ? composeStateAndExpires(reservation) : null;
    }, [composeStateAndExpires, reservation]);

    return (
        <StateNavLink
            name={'reservation-show'}
            params={{ id: reservation.id }}
            className="reservation-item"
            dataDusk={`reservationItem${reservation.id}`}>
            <div className="reservation-item-body">
                <div className="reservation-image">
                    <img
                        src={
                            reservation.product?.photo?.sizes?.small ||
                            reservation.product?.photo?.sizes?.thumbnail ||
                            assetUrl('/assets/img/placeholders/product-small.png')
                        }
                        alt=""
                    />
                </div>
                <div className="reservation-content">
                    <div className="reservation-section">
                        <div className="reservation-section-column">
                            <div className="reservation-name" role="heading" aria-level={2}>
                                <StateNavLink
                                    name={'product'}
                                    params={{ id: reservation.product?.id }}
                                    dataDusk="reservationProduct"
                                    role="link"
                                    tabIndex={0}
                                    customElement={'div'}>
                                    {reservation.product?.name}
                                </StateNavLink>
                            </div>
                            <div className="reservation-organization">
                                {reservation.records_title && (
                                    <Fragment>
                                        <span>{reservation.records_title}</span>
                                        <span className="text-separator" />
                                    </Fragment>
                                )}
                                <StateNavLink
                                    name={'provider'}
                                    params={{ id: reservation.product?.organization_id }}
                                    role="link"
                                    tabIndex={0}
                                    customElement={'span'}>
                                    {reservation.product?.organization?.name}
                                </StateNavLink>
                            </div>
                        </div>
                        <div className="reservation-section-column">
                            <div className="reservation-overview">
                                <div className="reservation-overview-status">
                                    {reservation.state === 'waiting' && stateData?.expiresIn > 0 && (
                                        <div className="label label-default-outline nowrap">
                                            <span className="label-blink label-blink-primary" aria-hidden="true" />
                                            <span className="label-text">
                                                {translate('reservations.card.remaining_minutes', {
                                                    minutes: stateData.expiresIn,
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`label label-${stateData.stateClass}`}
                                        data-dusk={stateData.stateDusk}>
                                        {stateData.stateText}
                                    </div>
                                </div>
                                <div className="reservation-overview-item hidden-xs hidden-sm">
                                    <div className="reservation-overview-label">
                                        {translate('reservation.labels.code')}
                                    </div>
                                    <div className="reservation-overview-value" data-dusk="reservationCode">
                                        #{reservation.code}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="reservation-section">
                        <div className="reservation-section-row">
                            <div className="reservation-value-list">
                                <div className="reservation-value-item">
                                    <div className="reservation-value-title">
                                        {translate('reservations.card.value.product_price')}
                                    </div>
                                    <div className="reservation-value">{reservation.price_voucher_locale}</div>
                                </div>

                                {reservation.amount_extra > 0 && (
                                    <div className="reservation-value-item">
                                        <div className="reservation-value-title">
                                            {translate('reservations.card.value.paid_by_self')}
                                        </div>
                                        <div className="reservation-value">{reservation.amount_extra_locale}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="reservation-section-row hidden-xs hidden-sm">
                            <div className="reservation-section-column">
                                <div className="reservation-overview reservation-overview-dates">
                                    <div className="reservation-overview-item">
                                        <div className="reservation-overview-label">
                                            {translate('reservation.labels.created_at')}
                                        </div>
                                        <div className="reservation-overview-value">
                                            {reservation.created_at_locale}
                                        </div>
                                    </div>

                                    {!reservation.expired && reservation.state === 'rejected' && (
                                        <div className="reservation-overview-item">
                                            <div className="reservation-overview-label">
                                                {translate('reservation.labels.rejected_at')}
                                            </div>
                                            <div className="reservation-overview-value">
                                                {reservation.rejected_at_locale}
                                            </div>
                                        </div>
                                    )}

                                    {!reservation.expired && reservation.canceled && (
                                        <div className="reservation-overview-item">
                                            <div className="reservation-overview-label">
                                                {translate('reservation.labels.canceled_at')}
                                            </div>
                                            <div className="reservation-overview-value">
                                                {reservation.canceled_at_locale}
                                            </div>
                                        </div>
                                    )}

                                    {reservation.expired && (
                                        <div className="reservation-overview-item">
                                            <div className="reservation-overview-label">
                                                {translate('reservation.labels.expired_at')}
                                            </div>
                                            <div className="reservation-overview-value">
                                                {reservation.expire_at_locale}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="reservation-actions">
                                    {reservation.amount_extra > 0 && !reservation.canceled && (
                                        <div className="reservation-action">
                                            <button
                                                type="button"
                                                className="button button-text button-xs hidden-xs hidden-sm"
                                                onClick={() => setShowExtraDetails(!showExtraDetails)}>
                                                {showExtraDetails
                                                    ? translate('reservations.card.actions.hide_all_details')
                                                    : translate('reservations.card.actions.show_all_details')}
                                                {showExtraDetails ? (
                                                    <em className="mdi icon-right mdi-chevron-up" />
                                                ) : (
                                                    <em className="mdi icon-right mdi-chevron-down" />
                                                )}
                                            </button>

                                            {(reservation.cancelable ||
                                                ['accepted', 'pending', 'waiting'].includes(reservation.state)) && (
                                                <button
                                                    className="button button-light button-xs"
                                                    data-dusk="btnCancelReservation"
                                                    type="button"
                                                    onClick={(e) => cancelReservation(e, reservation)}>
                                                    <em className="mdi mdi-trash-can-outline" />
                                                    {translate('reservation.labels.cancel')}
                                                </button>
                                            )}

                                            {reservation.state === 'waiting' &&
                                                reservation.extra_payment_expires_in > 0 && (
                                                    <button
                                                        className="button button-dark button-xs"
                                                        type="button"
                                                        onClick={(e) => payReservationExtra(e, reservation)}>
                                                        <em className="mdi mdi-credit-card-outline icon-start" />
                                                        {translate('reservations.card.actions.proceed_to_payment')}
                                                    </button>
                                                )}
                                        </div>
                                    )}

                                    {reservation.amount_extra == 0 && reservation.cancelable && (
                                        <div className="reservation-action">
                                            {(reservation.cancelable ||
                                                ['accepted', 'pending', 'waiting'].includes(reservation.state)) && (
                                                <button
                                                    className="button button-light button-xs"
                                                    data-dusk="btnCancelReservation"
                                                    type="button"
                                                    onClick={(e) => cancelReservation(e, reservation)}>
                                                    <em className="mdi mdi-trash-can-outline" />
                                                    {translate('reservation.labels.cancel')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="reservation-actions reservation-actions-mobile">
                {reservation.amount_extra > 0 && !reservation.canceled && (
                    <div className="reservation-action">
                        <button
                            type="button"
                            className="button button-text button-xs hidden-xs hidden-sm"
                            onClick={() => setShowExtraDetails(!showExtraDetails)}>
                            {showExtraDetails
                                ? translate('reservations.card.actions.hide_all_details')
                                : translate('reservations.card.actions.show_all_details')}
                            {showExtraDetails ? (
                                <em className="mdi icon-right mdi-chevron-up" />
                            ) : (
                                <em className="mdi icon-right mdi-chevron-down" />
                            )}
                        </button>

                        {(reservation.cancelable || ['accepted', 'pending', 'waiting'].includes(reservation.state)) && (
                            <button
                                type="button"
                                className="button button-light button-xs"
                                data-dusk="btnCancelReservation"
                                onClick={(e) => cancelReservation(e, reservation)}>
                                <em className="mdi mdi-trash-can-outline" />
                                {translate('reservation.labels.cancel')}
                            </button>
                        )}

                        {reservation.state === 'waiting' && reservation.extra_payment_expires_in > 0 && (
                            <button
                                className="button button-dark button-xs"
                                type="button"
                                onClick={(e) => payReservationExtra(e, reservation)}>
                                <em className="mdi mdi-credit-card-outline icon-start" />
                                {translate('reservations.card.actions.proceed_to_payment')}
                            </button>
                        )}
                    </div>
                )}

                {reservation.amount_extra == 0 && reservation.cancelable && (
                    <div className="reservation-action">
                        {(reservation.cancelable || ['accepted', 'pending', 'waiting'].includes(reservation.state)) && (
                            <button
                                className="button button-light button-xs"
                                data-dusk="btnCancelReservation"
                                type="button"
                                onClick={(e) => cancelReservation(e, reservation)}>
                                <em className="mdi mdi-trash-can-outline" />
                                {translate('reservation.labels.cancel')}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="reservation-details-toggle">
                <div className="reservation-overview reservation-overview-dates">
                    <div className="reservation-overview-item">
                        <div className="reservation-overview-label">{translate('reservation.labels.code')}</div>
                        <div className="reservation-overview-value" data-dusk="reservationCode">
                            #{reservation.code}
                        </div>
                    </div>
                    <div className="reservation-overview-item">
                        <div className="reservation-overview-label">{translate('reservation.labels.created_at')}</div>
                        <div className="reservation-overview-value">{reservation.created_at_locale}</div>
                    </div>

                    {!reservation.expired && reservation.state === 'rejected' && (
                        <div className="reservation-overview-item">
                            <div className="reservation-overview-label">
                                {translate('reservation.labels.rejected_at')}
                            </div>
                            <div className="reservation-overview-value">{reservation.rejected_at_locale}</div>
                        </div>
                    )}

                    {!reservation.expired && reservation.canceled && (
                        <div className="reservation-overview-item">
                            <div className="reservation-overview-label">
                                {translate('reservation.labels.canceled_at')}
                            </div>
                            <div className="reservation-overview-value">{reservation.canceled_at_locale}</div>
                        </div>
                    )}

                    {reservation.expired && (
                        <div className="reservation-overview-item">
                            <div className="reservation-overview-label">
                                {translate('reservation.labels.expired_at')}
                            </div>
                            <div className="reservation-overview-value">{reservation.expire_at_locale}</div>
                        </div>
                    )}
                </div>

                {reservation.amount_extra > 0 && !reservation.canceled && (
                    <div className="reservation-details-toggle-divider" />
                )}

                {reservation.amount_extra > 0 && !reservation.canceled && (
                    <button
                        className="button button-text button-xs"
                        type="button"
                        onClick={() => setShowExtraDetails(!showExtraDetails)}>
                        {showExtraDetails
                            ? translate('reservations.card.actions.hide_all_details')
                            : translate('reservations.card.actions.show_all_details')}
                        {showExtraDetails ? (
                            <em className="mdi icon-right mdi-chevron-up" />
                        ) : (
                            <em className="mdi icon-right mdi-chevron-down" />
                        )}
                    </button>
                )}
            </div>

            {showExtraDetails && (
                <div className="reservation-details">
                    <div className="reservation-details-pane">
                        {reservation.amount_extra > 0 && !reservation.canceled && (
                            <div className="reservation-details-contant">
                                <ul className="reservation-details-list">
                                    <li className="reservation-details-item">
                                        <div className="reservation-details-item-label">
                                            {translate('reservations.card.details.paid_via_bank_transfer')}
                                        </div>
                                        <div className="reservation-details-item-value">
                                            {reservation.amount_extra_locale}
                                        </div>
                                    </li>
                                    <li className="reservation-details-item">
                                        <div className="reservation-details-item-label">
                                            {translate('reservations.card.details.paid_from_credit')}
                                        </div>
                                        <div className="reservation-details-item-value">
                                            {reservation.amount_locale}
                                        </div>
                                    </li>
                                    <li className="reservation-details-item">
                                        <div className="reservation-details-item-label">
                                            {translate('reservations.card.details.total_product_price')}
                                        </div>
                                        <div className="reservation-details-item-value">
                                            {reservation.price_voucher_locale}
                                        </div>
                                    </li>
                                </ul>
                                <StateNavLink
                                    name={'reservation-show'}
                                    params={{ id: reservation.id }}
                                    className="reservation-details-view-all"
                                    customElement={'div'}>
                                    {translate('reservations.card.details.view_all_details')}
                                    <em className="mdi mdi-chevron-right" />
                                </StateNavLink>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {reservation.state === 'waiting' && stateData.expiresIn > 0 && (
                <div className="reservation-item-footer">{translate('reservation.expiring', stateData)}</div>
            )}
        </StateNavLink>
    );
}
