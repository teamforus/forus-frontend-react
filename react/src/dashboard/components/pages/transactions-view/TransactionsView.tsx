import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Transaction from '../../../props/models/Transaction';
import useTransactionService from '../../../services/TransactionService';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useParams } from 'react-router';
import TransactionDetailsPane from './elements/panes/TransactionDetailsPane';
import ReservationExtraPaymentDetailsPane from '../reservations-view/elements/panes/ReservationExtraPaymentDetailsPane';
import useTranslate from '../../../hooks/useTranslate';
import useAssetUrl from '../../../hooks/useAssetUrl';
import TransactionStateLabel from '../../elements/resource-states/TransactionStateLabel';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function TransactionsView() {
    const { address } = useParams();

    const assetUrl = useAssetUrl();
    const envData = useEnvData();
    const translate = useTranslate();
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
                    name={DashboardRoutes.TRANSACTIONS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {isSponsor
                        ? translate('page_state_titles.transactions')
                        : translate('page_state_titles.transactions_provider')}
                </StateNavLink>

                {isSponsor && (
                    <StateNavLink
                        name={DashboardRoutes.TRANSACTIONS}
                        params={{ organizationId: activeOrganization.id }}
                        activeExact={true}
                        className="breadcrumb-item">
                        {transaction.fund.name}
                    </StateNavLink>
                )}
                <div className="breadcrumb-item active">{'#' + transaction.id}</div>
            </div>

            <div className="block block-transaction-details">
                <div className="card card-wrapped">
                    <div className="card-header">
                        <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                            <span>{`#${transaction.id}`}</span>
                            <TransactionStateLabel transaction={transaction} />
                        </div>
                    </div>

                    {transaction.notes && transaction.notes.length != 0 && (
                        <div className="card-section">
                            <div className="card-block card-block-notes">
                                {transaction.notes.map((note) => (
                                    <div className="note-item" key={note.id}>
                                        <img
                                            alt={''}
                                            className="note-item-icon"
                                            src={assetUrl(`/assets/img/note-icons/note-icon-${note.icon}.jpg`)}
                                        />
                                        {note.message && <div className="note-item-text">{note.message}</div>}
                                        <div className="note-item-sign flex">
                                            <span>
                                                {'By ' +
                                                    (note.group == 'sponsor'
                                                        ? transaction.fund.organization_name
                                                        : transaction.organization.name)}
                                            </span>
                                            <em className="mdi mdi-circle" />
                                            <span>{note.created_at_locale}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="card-section form">
                        <div className="flex flex-gap flex-vertical form">
                            <TransactionDetailsPane
                                transaction={transaction}
                                setTransaction={setTransaction}
                                showReservationPageButton={true}
                            />

                            {transaction?.reservation?.extra_payment && (
                                <ReservationExtraPaymentDetailsPane
                                    organization={activeOrganization}
                                    reservation={transaction.reservation}
                                    payment={transaction.reservation.extra_payment}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
