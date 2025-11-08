import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useParams } from 'react-router';
import useTranslate from '../../../hooks/useTranslate';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import PayoutTransaction from '../../../props/models/PayoutTransaction';
import PayoutTransactionDetails from '../transactions-view/elements/PayoutTransactionDetails';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function PayoutsView() {
    const { address } = useParams();

    const envData = useEnvData();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const payoutTransactionService = usePayoutTransactionService();

    const [transaction, setTransaction] = useState<PayoutTransaction>(null);

    const fetchTransaction = useCallback(async () => {
        setProgress(0);

        return payoutTransactionService
            .show(envData.client_type, activeOrganization.id, address)
            .finally(() => setProgress(100));
    }, [activeOrganization.id, envData.client_type, setProgress, payoutTransactionService, address]);

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
                    name={DashboardRoutes.PAYOUTS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('page_state_titles.payouts')}
                </StateNavLink>

                <div className="breadcrumb-item active">{`#${transaction.id}`}</div>
            </div>

            <PayoutTransactionDetails transaction={transaction} />
        </Fragment>
    );
}
