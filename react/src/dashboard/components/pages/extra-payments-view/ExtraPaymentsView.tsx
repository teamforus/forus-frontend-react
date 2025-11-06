import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { hasPermission } from '../../../helpers/utils';
import useSetProgress from '../../../hooks/useSetProgress';
import { useParams } from 'react-router';
import useTransactionService from '../../../services/TransactionService';
import useEnvData from '../../../hooks/useEnvData';
import Transaction from '../../../props/models/Transaction';
import TransactionDetailsPane from '../transactions-view/elements/panes/TransactionDetailsPane';
import useExtraPaymentService from '../../../services/ExtraPaymentService';
import ExtraPayment from '../../../props/models/ExtraPayment';
import ReservationExtraPaymentDetailsPane from '../reservations-view/elements/panes/ReservationExtraPaymentDetailsPane';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import { Permission } from '../../../props/models/Organization';
import ReservationStateLabel from '../../elements/resource-states/ReservationStateLabel';
import ReservationOverviewPane from './elements/panes/ReservationOverviewPane';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ExtraPaymentsView() {
    const { id } = useParams();
    const envData = useEnvData();
    const activeOrganization = useActiveOrganization();

    const transactionService = useTransactionService();
    const extraPaymentService = useExtraPaymentService();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const [transaction, setTransaction] = useState<Transaction>(null);
    const [extraPayment, setExtraPayment] = useState<ExtraPayment>(null);

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

    const fetchExtraPayment = useCallback(
        (extra_payment_id: number) => {
            setProgress(0);

            extraPaymentService
                .read(activeOrganization.id, extra_payment_id)
                .then((res) => setExtraPayment(res.data.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, extraPaymentService, pushApiError, setProgress],
    );

    useEffect(() => {
        fetchExtraPayment(parseInt(id));
    }, [fetchExtraPayment, id]);

    useEffect(() => {
        if (extraPayment?.reservation?.voucher_transaction?.address) {
            fetchTransaction(extraPayment.reservation.voucher_transaction.address);
        }
    }, [fetchTransaction, extraPayment?.reservation?.voucher_transaction?.address]);

    if (!extraPayment) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.EXTRA_PAYMENTS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Bijbetalingen
                </StateNavLink>
                <div className="breadcrumb-item active">{`#${extraPayment.reservation.code}`}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                        <span>{`#${extraPayment.reservation.code}`}</span>
                        <ReservationStateLabel reservation={extraPayment.reservation} />
                    </div>
                </div>

                <div className="card-section form">
                    <div className="flex flex-gap flex-vertical form">
                        <ReservationOverviewPane
                            reservation={extraPayment.reservation}
                            organization={activeOrganization}
                        />
                    </div>
                </div>
            </div>

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
                            />
                        )}

                        <ReservationExtraPaymentDetailsPane
                            organization={activeOrganization}
                            reservation={extraPayment.reservation}
                            payment={extraPayment}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
