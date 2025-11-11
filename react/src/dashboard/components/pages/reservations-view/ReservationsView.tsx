import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { hasPermission } from '../../../helpers/utils';
import useSetProgress from '../../../hooks/useSetProgress';
import Reservation from '../../../props/models/Reservation';
import { useParams } from 'react-router';
import useProductReservationService from '../../../services/ProductReservationService';
import useConfirmReservationApproval from '../../../services/helpers/reservations/useConfirmReservationApproval';
import useTransactionService from '../../../services/TransactionService';
import useEnvData from '../../../hooks/useEnvData';
import Transaction from '../../../props/models/Transaction';
import useShowRejectInfoExtraPaid from '../../../services/helpers/reservations/useShowRejectInfoExtraPaid';
import TransactionDetailsPane from '../transactions-view/elements/panes/TransactionDetailsPane';
import ReservationExtraPaymentRefundsCard from './elements/ReservationExtraPaymentRefundsCard';
import ReservationExtraPaymentDetailsPane from './elements/panes/ReservationExtraPaymentDetailsPane';
import usePushApiError from '../../../hooks/usePushApiError';
import ProductDetailsBlockPropertiesPane from '../products-view/elements/panes/ProductDetailsBlockPropertiesPane';
import ReservationStateLabel from '../../elements/resource-states/ReservationStateLabel';
import ModalReservationReject from '../../modals/ModalReservationReject';
import useOpenModal from '../../../hooks/useOpenModal';
import ReservationExtraInformationPane from './elements/panes/ReservationExtraInformationPane';
import ReservationOverviewPane from './elements/panes/ReservationOverviewPane';
import ReservationDetailsPane from './elements/panes/ReservationDetailsPane';
import useTranslate from '../../../hooks/useTranslate';
import { Permission } from '../../../props/models/Organization';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ReservationsView() {
    const { id } = useParams();

    const envData = useEnvData();
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const transactionService = useTransactionService();
    const productReservationService = useProductReservationService();

    const [transaction, setTransaction] = useState<Transaction>(null);
    const [reservation, setReservation] = useState<Reservation>(null);

    const showRejectInfoExtraPaid = useShowRejectInfoExtraPaid();
    const confirmReservationApproval = useConfirmReservationApproval();

    const fetchTransaction = useCallback(
        (transaction_address: string) => {
            setProgress(0);

            transactionService
                .show(envData.client_type, activeOrganization.id, transaction_address)
                .then((res) => setTransaction(res.data.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, envData.client_type, pushApiError, setProgress, transactionService],
    );

    const fetchReservation = useCallback(
        (reservation_id: number) => {
            setProgress(0);

            productReservationService
                .read(activeOrganization.id, reservation_id)
                .then((res) => setReservation(res.data.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, productReservationService, pushApiError, setProgress],
    );

    const acceptReservation = useCallback(
        (reservation: Reservation) => {
            confirmReservationApproval([reservation], () => {
                setProgress(0);

                productReservationService
                    .accept(activeOrganization.id, reservation.id)
                    .then((res) => {
                        pushSuccess('Opgeslagen!');

                        setReservation(res.data.data);

                        if (reservation.voucher_transaction?.address) {
                            fetchTransaction(reservation.voucher_transaction?.address);
                        }
                    })
                    .catch(pushApiError)
                    .then(() => setProgress(100));
            });
        },
        [
            activeOrganization.id,
            confirmReservationApproval,
            fetchTransaction,
            productReservationService,
            pushApiError,
            pushSuccess,
            setProgress,
        ],
    );

    const rejectReservation = useCallback(
        (reservation: Reservation) => {
            if (reservation.extra_payment?.is_paid && !reservation.extra_payment?.is_fully_refunded) {
                return showRejectInfoExtraPaid();
            }

            openModal((modal) => {
                return (
                    <ModalReservationReject
                        modal={modal}
                        organization={activeOrganization}
                        reservations={[reservation]}
                        onDone={() => fetchReservation(reservation.id)}
                    />
                );
            });
        },
        [activeOrganization, fetchReservation, openModal, showRejectInfoExtraPaid],
    );

    const onTransactionUpdate = useCallback(() => {
        fetchReservation(reservation.id);
    }, [fetchReservation, reservation?.id]);

    const onExtraPaymentUpdate = useCallback(() => {
        fetchReservation(reservation.id);

        if (reservation?.voucher_transaction?.address) {
            fetchTransaction(reservation.voucher_transaction.address);
        }
    }, [fetchReservation, fetchTransaction, reservation?.id, reservation?.voucher_transaction?.address]);

    useEffect(() => {
        fetchReservation(parseInt(id));
    }, [fetchReservation, id]);

    useEffect(() => {
        if (reservation?.voucher_transaction?.address) {
            fetchTransaction(reservation.voucher_transaction.address);
        }
    }, [fetchTransaction, reservation?.voucher_transaction?.address]);

    if (!reservation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.RESERVATIONS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Reserveringen
                </StateNavLink>
                <div className="breadcrumb-item active">{`#${reservation.code}`}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                        <span>{`#${reservation.code}`}</span>
                        <ReservationStateLabel reservation={reservation} />
                    </div>

                    <div className="card-header-filters flex-self-start">
                        <div className="block block-inline-filters">
                            <div className="button-group">
                                {reservation.acceptable && (
                                    <div
                                        className="button button-primary button-sm"
                                        onClick={() => acceptReservation(reservation)}>
                                        <em className="mdi mdi-check icon-start" />
                                        Accepteer
                                    </div>
                                )}

                                {reservation.rejectable && (
                                    <div
                                        className="button button-danger button-sm"
                                        onClick={() => rejectReservation(reservation)}>
                                        <em className="mdi mdi-close icon-start" />
                                        Weiger
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section form">
                    <div className="flex flex-gap flex-vertical form">
                        <ReservationOverviewPane reservation={reservation} />

                        <ProductDetailsBlockPropertiesPane
                            title={'Aanbod details'}
                            product={reservation.product}
                            viewType={'provider'}
                            showName={true}
                        />

                        <ReservationDetailsPane reservation={reservation} />

                        <ReservationExtraInformationPane
                            organization={activeOrganization}
                            reservation={reservation}
                            setReservation={setReservation}
                        />
                    </div>
                </div>
            </div>

            {((transaction && hasPermission(activeOrganization, Permission.VIEW_FINANCES)) ||
                reservation.extra_payment) && (
                <div className="card card-wrapped">
                    <div className="card-header">
                        <div className="flex flex-grow card-title">
                            {translate('financial_dashboard_transaction.labels.details')}
                        </div>
                    </div>
                    <div className="card-section form">
                        <div className="flex flex-gap flex-vertical form">
                            {transaction && hasPermission(activeOrganization, Permission.VIEW_FINANCES) && (
                                <TransactionDetailsPane
                                    transaction={transaction}
                                    setTransaction={setTransaction}
                                    showDetailsPageButton={true}
                                    showState={true}
                                    onUpdate={onTransactionUpdate}
                                />
                            )}

                            {reservation.extra_payment && (
                                <ReservationExtraPaymentDetailsPane
                                    organization={activeOrganization}
                                    reservation={reservation}
                                    payment={reservation.extra_payment}
                                    onUpdate={onExtraPaymentUpdate}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {reservation.extra_payment && reservation.extra_payment.refunds.length > 0 && (
                <ReservationExtraPaymentRefundsCard refunds={reservation.extra_payment.refunds} />
            )}
        </Fragment>
    );
}
