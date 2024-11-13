import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import Reservation from '../../../../dashboard/props/models/Reservation';
import { useProductReservationService } from '../../../services/ProductReservationService';
import { useParams } from 'react-router-dom';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useComposeStateAndExpires from '../reservations/hooks/useComposeStateAndExpires';
import usePayReservationExtra from '../reservations/hooks/usePayReservationExtra';
import useCancelReservation from '../reservations/hooks/useCancelReservation';
import { BooleanParam, useQueryParam } from 'use-query-params';

export default function ReservationsShow() {
    const { id } = useParams();
    const [checkout] = useQueryParam('checkout', BooleanParam);

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const cancelReservation = useCancelReservation();
    const payReservationExtra = usePayReservationExtra();
    const composeStateAndExpires = useComposeStateAndExpires();

    const productReservationService = useProductReservationService();

    const [reservation, setReservation] = useState<Reservation>(null);

    const [showLoadingBtn, setShowLoadingBtn] = useState(false);
    const [showReservationRefunds, setShowReservationRefunds] = useState(true);
    const [showReservationExtraAmount, setShowReservationExtraAmount] = useState(true);

    const isCheckout = useMemo(() => {
        return checkout && reservation?.extra_payment?.is_pending;
    }, [reservation?.extra_payment?.is_pending, checkout]);

    const stateData = useMemo(() => {
        return reservation ? composeStateAndExpires(reservation) : null;
    }, [reservation, composeStateAndExpires]);

    const fetchReservation = useCallback(async () => {
        setProgress(0);

        return productReservationService
            .read(parseInt(id))
            .then((res) => setReservation(res.data.data))
            .finally(() => setProgress(100));
    }, [id, productReservationService, setProgress]);

    useEffect(() => {
        fetchReservation().then();
    }, [fetchReservation]);

    useEffect(() => {
        if (isCheckout) {
            setShowLoadingBtn(true);

            const timeout = window.setTimeout(() => {
                fetchReservation().then(() => setShowLoadingBtn(false));
            }, 5000);

            return () => window.clearTimeout(timeout);
        }
    }, [fetchReservation, isCheckout]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: 'Home', state: 'home' },
                { name: translate('reservations.header.title'), state: 'reservations' },
                { name: 'Reservering' },
            ]}
            profileHeader={<></>}
            contentDusk={'reservationDetailsPage'}>
            {reservation && (
                <Fragment>
                    <div className="card">
                        <div className="card-section">
                            <div className="block block-reservation" data-dusk="reservationOverview">
                                <div className="reservation-section">
                                    <div className="reservation-media">
                                        <div className="media-preview">
                                            <img
                                                src={
                                                    reservation?.product?.photo?.sizes?.small ||
                                                    reservation.product?.photo?.sizes?.thumbnail ||
                                                    assetUrl('/assets/img/placeholders/product-small.png')
                                                }
                                                alt=""
                                            />
                                        </div>
                                    </div>
                                    <div className="reservation-content">
                                        <div className="reservation-header">
                                            <h2 className="reservation-title">Details van de reservering</h2>
                                            <div className={`label label-${stateData.stateClass}`}>
                                                {stateData.stateText}
                                            </div>
                                        </div>
                                        <div className="block block-key-value-list block-key-value-list-pane">
                                            <div className="block-key-value-list-item">
                                                <div className="key-value-list-item-label">Titel</div>
                                                <div
                                                    className="key-value-list-item-value"
                                                    data-dusk="reservationOverviewTitle">
                                                    <StateNavLink
                                                        name={'product'}
                                                        params={{ id: reservation.product.id }}>
                                                        {reservation.product.name}
                                                    </StateNavLink>
                                                </div>
                                            </div>
                                            <div className="block-key-value-list-item">
                                                <div className="key-value-list-item-label">ID</div>
                                                <div
                                                    className="key-value-list-item-value"
                                                    data-dusk="reservationOverviewCode">
                                                    #{reservation.code}
                                                </div>
                                            </div>
                                            <div className="block-key-value-list-item">
                                                <div className="key-value-list-item-label">Fonds naam</div>
                                                <div
                                                    className="key-value-list-item-value"
                                                    data-dusk="reservationOverviewFundName">
                                                    {reservation.fund.name}
                                                </div>
                                            </div>
                                            {reservation.amount_extra > 0 && (
                                                <div className="block-key-value-list-item">
                                                    <div className="key-value-list-item-label">Betaald van tegoed</div>
                                                    <div
                                                        className="key-value-list-item-value"
                                                        data-dusk="reservationOverviewCode">
                                                        {reservation.amount_locale}
                                                    </div>
                                                </div>
                                            )}
                                            {reservation.amount_extra > 0 && (
                                                <div className="block-key-value-list-item">
                                                    <div className="key-value-list-item-label">Zelf bijbetaald</div>
                                                    <div
                                                        className="key-value-list-item-value"
                                                        data-dusk="reservationOverviewExtraAmount">
                                                        {reservation.amount_extra_locale}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="block-key-value-list-item">
                                                <div className="key-value-list-item-label">Bedrag</div>
                                                <div
                                                    className="key-value-list-item-value"
                                                    data-dusk="reservationOverviewAmount">
                                                    {reservation.price_locale}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="reservation-actions">
                                            {(reservation.cancelable ||
                                                ['accepted', 'pending', 'waiting'].includes(reservation.state)) &&
                                                !showLoadingBtn && (
                                                    <button
                                                        className="button button-light button-sm"
                                                        onClick={(e) => cancelReservation(e, reservation)}>
                                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                                        {translate('reservation.labels.cancel')}
                                                    </button>
                                                )}

                                            {reservation.state === 'waiting' &&
                                                stateData.expiresIn > 0 &&
                                                !showLoadingBtn && (
                                                    <button
                                                        className="button button-primary button-sm"
                                                        onClick={(e) => payReservationExtra(e, reservation)}>
                                                        <em className="mdi mdi-credit-card-outline icon-start" />
                                                        Ga door naar betalen
                                                    </button>
                                                )}

                                            {showLoadingBtn && (
                                                <button className="button button-primary button-sm" disabled={true}>
                                                    <em className="mdi mdi-loading mdi-spin icon-start" />
                                                    Loading
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {reservation.state === 'waiting' && stateData.expiresIn && !showLoadingBtn && (
                            <div className="card-footer card-footer-warning card-footer-sm">
                                Houd er rekening mee dat er nog <strong>{stateData.expiresIn} minuten</strong> over zijn
                                om de bijbetaling uit te voeren. Anders zal de reservering automatisch worden
                                geannuleerd.
                            </div>
                        )}

                        {reservation.state === 'canceled_payment_expired' && (
                            <div className="card-footer card-footer-warning card-footer-sm">
                                Sorry, uw reservering is tijdens het afrekenproces geannuleerd omdat het geselecteerde
                                product uitverkocht is.
                            </div>
                        )}
                    </div>

                    {reservation.extra_payment && (
                        <div className={`card card-collapsable ${showReservationExtraAmount ? 'open' : ''}`}>
                            <div
                                className="card-header"
                                onClick={() => setShowReservationExtraAmount(!showReservationExtraAmount)}>
                                <div className="card-header-wrapper">
                                    <em className="mdi mdi-menu-down card-header-arrow" />
                                    <h2 className="card-heading card-heading-lg">Bijbetalingsgegevens</h2>
                                </div>
                            </div>
                            {showReservationExtraAmount && (
                                <div className="card-section">
                                    <div className="block block-key-value-list block-key-value-list-pane">
                                        <div className="block-key-value-list-item">
                                            <div className="key-value-list-item-label">Status:</div>
                                            <div className="key-value-list-item-value">
                                                {!reservation.extra_payment.is_fully_refunded &&
                                                    reservation.extra_payment.is_paid && (
                                                        <div className="label label-success">
                                                            {reservation.extra_payment.state_locale}
                                                        </div>
                                                    )}

                                                {!reservation.extra_payment.is_fully_refunded &&
                                                    reservation.extra_payment.is_pending && (
                                                        <div className="label label-default">
                                                            {reservation.extra_payment.state_locale}
                                                        </div>
                                                    )}

                                                {['failed', 'canceled', 'expired'].includes(
                                                    reservation.extra_payment.state,
                                                ) && (
                                                    <div className="label label-danger">
                                                        {reservation.extra_payment.state_locale}
                                                    </div>
                                                )}

                                                {reservation.extra_payment.is_fully_refunded && (
                                                    <div className="label label-danger">Terugbetaald</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="block-key-value-list-item">
                                            <div className="key-value-list-item-label">Datum:</div>
                                            <div className="key-value-list-item-value">
                                                {reservation.extra_payment.paid_at_locale || '-'}
                                            </div>
                                        </div>
                                        <div className="block-key-value-list-item">
                                            <div className="key-value-list-item-label">Zelf bijbetaal:</div>
                                            <div className="key-value-list-item-value">
                                                {reservation.extra_payment.amount_locale}
                                            </div>
                                        </div>
                                        <div className="block-key-value-list-item">
                                            <div className="key-value-list-item-label">Methode:</div>
                                            <div className="key-value-list-item-value">
                                                {reservation.extra_payment.method}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {reservation?.extra_payment?.refunds?.length > 0 && (
                        <div className={`card card-collapsable ${showReservationRefunds ? 'open' : ''}`}>
                            <div
                                className="card-header"
                                onClick={() => setShowReservationRefunds(!showReservationRefunds)}>
                                <div className="card-header-wrapper">
                                    <em className="mdi mdi-menu-down card-header-arrow" />
                                    <h2 className="card-heading card-heading-lg">Details van terugbetaling</h2>
                                </div>
                            </div>

                            {showReservationRefunds && (
                                <div className="card-section">
                                    <div className="block block-card-table block-card-table-insert-top">
                                        <table>
                                            <tbody>
                                                <tr className="hide-sm">
                                                    <th>Datum</th>
                                                    <th>Bedrag</th>
                                                    <th>Status</th>
                                                </tr>
                                                {reservation.extra_payment.refunds.map((refund) => (
                                                    <tr key={refund.id}>
                                                        <td>
                                                            <div className="block-card-table-item">
                                                                <div className="block-card-table-label show-sm">
                                                                    Datum
                                                                </div>
                                                                <div className="block-card-table-value">
                                                                    {refund.created_at_locale}
                                                                </div>
                                                            </div>
                                                            <div className="block-card-table-item show-sm">
                                                                <div className="block-card-table-label">Status</div>
                                                                {refund.state == 'refunded' && (
                                                                    <div className="label label-success">
                                                                        {refund.state_locale}
                                                                    </div>
                                                                )}

                                                                {['canceled', 'failed'].includes(refund.state) && (
                                                                    <div className="label label-danger">
                                                                        {refund.state_locale}
                                                                    </div>
                                                                )}

                                                                {!['refunded', 'canceled', 'failed'].includes(
                                                                    refund.state,
                                                                ) && (
                                                                    <div className="label label-warning">
                                                                        {refund.state_locale}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="block-card-table-item">
                                                                <div className="block-card-table-label show-sm">
                                                                    Bedrag
                                                                </div>
                                                                <div className="block-card-table-value">
                                                                    {refund.amount_locale}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="hide-sm">
                                                            <div className="block-card-table-item">
                                                                {refund.state == 'refunded' && (
                                                                    <div className="label label-success">
                                                                        {refund.state_locale}
                                                                    </div>
                                                                )}

                                                                {['canceled', 'failed'].includes(refund.state) && (
                                                                    <div className="label label-danger">
                                                                        {refund.state_locale}
                                                                    </div>
                                                                )}

                                                                {!['refunded', 'canceled', 'failed'].includes(
                                                                    refund.state,
                                                                ) && (
                                                                    <div className="label label-warning">
                                                                        {refund.state_locale}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
