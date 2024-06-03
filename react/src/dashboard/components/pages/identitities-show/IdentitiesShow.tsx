import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useFundService } from '../../../services/FundService';
import useSetProgress from '../../../hooks/useSetProgress';
import Fund from '../../../props/models/Fund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Identity from '../../../props/models/Sponsor/Identity';
import IdentityVouchersCard from './elements/IdentityVouchersCard';
import LoadingCard from '../../elements/loading-card/LoadingCard';

export default function IdentitiesShow() {
    const activeOrganization = useActiveOrganization();

    const setProgress = useSetProgress();
    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);
    const [identity, setIdentity] = useState<Identity>(null);

    const fundId = parseInt(useParams().fundId);
    const identityId = parseInt(useParams().id);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(activeOrganization.id, fundId)
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, fundId, setProgress]);

    const fetchIdentity = useCallback(() => {
        setProgress(0);

        fundService
            .readIdentity(activeOrganization.id, fundId, identityId)
            .then((res) => setIdentity(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, fundId, identityId, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchIdentity();
    }, [fetchIdentity]);

    if (!identity || !fund) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="funds-show"
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id, fundId: fundId }}>
                    {fund?.name}
                </StateNavLink>

                <div className="breadcrumb-item active">{identity?.email}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                <span>{identity?.email}</span>
                            </div>
                        </div>
                        {/*todo: investigate later*/}
                        {/*{identity?.bsn && (
                            <div className="flex flex-self-start">
                                <div className="card-title">
                                    <span className="text-strong text-md text-primary">BSN:</span>
                                    <span className="text-strong text-md text-muted-dark">{identity.bsn}</span>
                                </div>
                            </div>
                        )}*/}
                    </div>
                </div>
            </div>

            <IdentityVouchersCard
                fund={fund}
                identity={identity}
                organization={activeOrganization}
                blockTitle={'Vouchers'}
            />
        </Fragment>
    );
}
