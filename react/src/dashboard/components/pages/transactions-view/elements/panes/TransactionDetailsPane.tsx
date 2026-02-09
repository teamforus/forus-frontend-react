import Transaction from '../../../../../props/models/Transaction';
import useTransactionService from '../../../../../services/TransactionService';
import useProductReservationService from '../../../../../services/ProductReservationService';
import Reservation from '../../../../../props/models/Reservation';
import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import useEnvData from '../../../../../hooks/useEnvData';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import Tooltip from '../../../../elements/tooltip/Tooltip';
import useOpenModal from '../../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../../modals/ModalDangerZone';
import usePushSuccess from '../../../../../hooks/usePushSuccess';
import useShowRejectInfoExtraPaid from '../../../../../services/helpers/reservations/useShowRejectInfoExtraPaid';
import LoadingCard from '../../../../elements/loading-card/LoadingCard';
import useTranslate from '../../../../../hooks/useTranslate';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import TransactionStateLabel from '../../../../elements/resource-states/TransactionStateLabel';
import usePushApiError from '../../../../../hooks/usePushApiError';
import FormPane from '../../../../elements/forms/elements/FormPane';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import EmptyValue from '../../../../elements/empty-value/EmptyValue';
import { DashboardRoutes } from '../../../../../modules/state_router/RouterBuilder';

export default function TransactionDetailsPane({
    transaction,
    setTransaction,
    showDetailsPageButton = false,
    showReservationPageButton = false,
    showState = false,
    onUpdate,
}: {
    transaction: Transaction;
    setTransaction: React.Dispatch<Transaction>;
    showDetailsPageButton?: boolean;
    showReservationPageButton?: boolean;
    showState?: boolean;
    onUpdate?: () => void;
}) {
    const envData = useEnvData();
    const activeOrganization = useActiveOrganization();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const showRejectInfoExtraPaid = useShowRejectInfoExtraPaid();

    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData.client_type]);
    const isProvider = useMemo(() => envData.client_type == 'provider', [envData.client_type]);

    const transactionService = useTransactionService();
    const productReservationService = useProductReservationService();

    const fetchTransaction = useCallback(() => {
        return transactionService.show(envData.client_type, activeOrganization.id, transaction.address);
    }, [activeOrganization.id, envData.client_type, transactionService, transaction.address]);

    const cancelTransaction = useCallback(
        (reservation: Reservation) => {
            if (reservation.extra_payment?.is_paid && !reservation.extra_payment?.is_fully_refunded) {
                return showRejectInfoExtraPaid();
            }

            openModal((modal) => {
                return (
                    <ModalDangerZone
                        modal={modal}
                        title={'Weet u zeker dat u de betaling wilt annuleren?'}
                        description_text={[
                            'Als u de betaling annuleert wordt de bestelling ongedaan gemaakt.',
                            'U ontvangt geen betaling en de klant krijgt het tegoed terug.',
                        ].join(' ')}
                        buttonCancel={{
                            text: 'Sluiten',
                            onClick: () => modal.close(),
                        }}
                        buttonSubmit={{
                            text: 'Bevestigen',
                            onClick: () => {
                                modal.close();
                                productReservationService
                                    .reject(activeOrganization.id, reservation.id)
                                    .then(() => {
                                        pushSuccess('Opgeslagen!');
                                        fetchTransaction().then((res) => setTransaction(res.data.data));
                                        onUpdate?.();
                                    })
                                    .catch(pushApiError);
                            },
                        }}
                    />
                );
            });
        },
        [
            activeOrganization.id,
            fetchTransaction,
            onUpdate,
            openModal,
            productReservationService,
            pushApiError,
            pushSuccess,
            setTransaction,
            showRejectInfoExtraPaid,
        ],
    );

    useEffect(() => {
        fetchTransaction().then((res) => setTransaction(res.data.data));
    }, [fetchTransaction, setTransaction]);

    if (!transaction) {
        return <LoadingCard />;
    }

    return (
        <FormPane title={'Transactie details'} large={true}>
            <div className="flex">
                <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                    <KeyValueItem label={translate('financial_dashboard_transaction.labels.id')}>
                        {showDetailsPageButton ? (
                            <StateNavLink
                                name={DashboardRoutes.TRANSACTION}
                                className="text-primary text-semibold text-inherit text-decoration-link"
                                params={{
                                    organizationId: activeOrganization.id,
                                    address: transaction.address,
                                }}>
                                {`#${transaction.id}`}
                            </StateNavLink>
                        ) : (
                            `#${transaction.id}`
                        )}
                    </KeyValueItem>

                    <KeyValueItem label={translate('financial_dashboard_transaction.labels.amount')}>
                        {transaction.amount_locale}
                    </KeyValueItem>

                    {isSponsor && transaction.payment_id && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.bunq_id')}>
                            {transaction.payment_id}
                        </KeyValueItem>
                    )}

                    {isSponsor && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.statement')}>
                            <Fragment>
                                {['provider', 'iban'].includes(transaction.target) &&
                                    (transaction?.organization?.name || 'Aanvrager')}
                                {['top_up'].includes(transaction.target) && 'Top up'}
                                {['payout'].includes(transaction.target) && 'Uitbetaling'}
                            </Fragment>
                        </KeyValueItem>
                    )}

                    {transaction.product && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.product_id')}>
                            {transaction.product.id}
                        </KeyValueItem>
                    )}

                    {transaction.product && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.product_name')}>
                            {isSponsor ? (
                                <StateNavLink
                                    name={DashboardRoutes.SPONSOR_PRODUCT}
                                    params={{
                                        organizationId: activeOrganization.id,
                                        productId: transaction.product?.id,
                                    }}
                                    className="text-primary text-semibold text-inherit text-decoration-link">
                                    {transaction.product?.name}
                                </StateNavLink>
                            ) : (
                                <StateNavLink
                                    name={DashboardRoutes.PRODUCT}
                                    params={{
                                        organizationId: activeOrganization.id,
                                        id: transaction.product?.id,
                                    }}
                                    className="text-primary text-semibold text-inherit text-decoration-link">
                                    {transaction.product?.name}
                                </StateNavLink>
                            )}
                        </KeyValueItem>
                    )}

                    {isSponsor && transaction.target !== 'top_up' && transaction.state == 'success' && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.bunq')}>
                            {transaction.transaction_cost_locale}
                        </KeyValueItem>
                    )}

                    <KeyValueItem label={translate('financial_dashboard_transaction.labels.date')}>
                        {transaction.created_at_locale}
                    </KeyValueItem>

                    {isSponsor && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.date_non_cancelable')}>
                            {transaction.non_cancelable_at_locale || <TableEmptyValue />}
                        </KeyValueItem>
                    )}

                    {showState && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.status')}>
                            <TransactionStateLabel transaction={transaction} />
                        </KeyValueItem>
                    )}

                    <KeyValueItem label={translate('financial_dashboard_transaction.labels.transfer_in')}>
                        {transaction.transfer_in > 0 && transaction.state == 'pending' ? (
                            <div className="text-muted-dark">
                                <em className="mdi mdi-clock-outline"> </em>
                                {transaction.transfer_in} dagen resterend
                            </div>
                        ) : (
                            <EmptyValue />
                        )}
                    </KeyValueItem>

                    {transaction.iban_from && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.iban_from')}>
                            <Fragment>
                                <span className={classNames(!transaction.iban_final && 'text-muted-dark')}>
                                    {transaction.iban_from}
                                </span>
                                {!transaction.iban_final && (
                                    <Tooltip
                                        text={translate('financial_dashboard_transaction.tooltips.pending_iban_from')}
                                    />
                                )}
                            </Fragment>
                        </KeyValueItem>
                    )}

                    {transaction.iban_to && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.iban_to')}>
                            <Fragment>
                                <span
                                    className={classNames(
                                        !transaction.iban_final && transaction.target != 'iban' && 'text-muted-dark',
                                    )}>
                                    {transaction.iban_to}
                                </span>

                                {!transaction.iban_final && transaction.target != 'iban' && (
                                    <Tooltip
                                        text={translate('financial_dashboard_transaction.tooltips.pending_iban_to')}
                                    />
                                )}
                            </Fragment>
                        </KeyValueItem>
                    )}

                    {transaction.iban_to_name && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.iban_to_name')}>
                            <Fragment>
                                <span
                                    className={classNames(
                                        !transaction.iban_final && transaction.target != 'iban' && 'text-muted-dark',
                                    )}>
                                    {transaction.iban_to_name}
                                </span>
                                {!transaction.iban_final && transaction.target != 'iban' && (
                                    <Tooltip
                                        text={translate('financial_dashboard_transaction.tooltips.pending_iban_to')}
                                    />
                                )}
                            </Fragment>
                        </KeyValueItem>
                    )}

                    {transaction.amount_extra_cash && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.amount_extra_cash')}>
                            {transaction.amount_extra_cash_locale}
                        </KeyValueItem>
                    )}

                    {transaction.reservation && isProvider && showReservationPageButton && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.reservation')}>
                            <StateNavLink
                                name={DashboardRoutes.RESERVATION}
                                className="text-primary text-semibold text-inherit text-decoration-link"
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: transaction.reservation.id,
                                }}>
                                {`#${transaction.reservation.code}`}
                            </StateNavLink>
                        </KeyValueItem>
                    )}

                    {transaction.voucher_id && transaction.target !== 'payout' && isSponsor && (
                        <KeyValueItem label={translate('financial_dashboard_transaction.labels.voucher')}>
                            <StateNavLink
                                name={DashboardRoutes.VOUCHER}
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: transaction.product_reservation?.voucher_id || transaction.voucher_id,
                                }}
                                className="text-primary text-semibold text-inherit text-decoration-link">
                                {`#${transaction.product_reservation?.voucher_id || transaction.voucher_id}`}
                            </StateNavLink>
                        </KeyValueItem>
                    )}
                </div>
            </div>

            {transaction.cancelable && transaction.reservation && (
                <Fragment>
                    <div className="form-pane-separator" />

                    <div className="button-group">
                        <button
                            className="button button-danger button-sm"
                            onClick={() => cancelTransaction(transaction.reservation)}>
                            <em className="mdi mdi-cash-refund icon-start" />
                            Betaling annuleren
                        </button>
                    </div>
                </Fragment>
            )}
        </FormPane>
    );
}
