import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import Transaction from '../../../props/models/Transaction';
import useTransactionService from '../../../services/TransactionService';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useParams } from 'react-router-dom';
import TransactionDetails from './elements/TransactionDetails';
import ReservationExtraPaymentDetails from '../reservations-view/elements/ReservationExtraPaymentDetails';

export default function TransactionsView() {
    const { t } = useTranslation();
    const { address } = useParams();

    const envData = useEnvData();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData.client_type]);
    const transactionService = useTransactionService();

    const [transaction, setTransaction] = useState<Transaction>(null);

    const fetchTransaction = useCallback(async () => {
        setProgress(0);

        return transactionService
            .show(envData.client_type, activeOrganization.id, address)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, envData.client_type, setProgress, transactionService, address]);

    useEffect(() => {
        fetchTransaction().then((res) => setTransaction(res.data.data));
    }, [fetchTransaction]);

    if (!transaction) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'transactions'}
                    params={{ organizationId: activeOrganization.id }}
                    className="breadcrumb-item">
                    {t('page_state_titles.transactions')}
                </StateNavLink>

                {isSponsor && (
                    <StateNavLink
                        name={'transactions'}
                        params={{ organizationId: activeOrganization.id }}
                        className="breadcrumb-item">
                        {transaction.fund.name}
                    </StateNavLink>
                )}
                <div className="breadcrumb-item active">{'#' + transaction.id}</div>
            </div>

            <TransactionDetails
                transaction={transaction}
                setTransaction={setTransaction}
                showReservationPageButton={true}
                showAmount={true}
            />

            {transaction?.reservation?.extra_payment && (
                <ReservationExtraPaymentDetails
                    organization={activeOrganization}
                    reservation={transaction.reservation}
                    payment={transaction.reservation.extra_payment}
                />
            )}
        </Fragment>
    );
}