import React, { Fragment, useCallback, useEffect, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import { useParams } from 'react-router-dom';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';
import OrganizationsFundsShowDetailsCard from './elements/OrganizationsFundsShowDetailsCard';
import OrganizationsFundsShowRelationsCard from './elements/OrganizationsFundsShowRelationsCard';
import OrganizationFundsShowOverviewCard from './elements/OrganizationFundsShowOverviewCard';

export default function OrganizationsFundsShow() {
    const fundId = useParams().fundId;

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(activeOrganization.id, parseInt(fundId), { stats: 'budget' })
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    if (!fund) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="organization-funds"
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id }}>
                    {translate('page_state_titles.funds')}
                </StateNavLink>

                <div className="breadcrumb-item active">{fund.name}</div>
            </div>

            <OrganizationFundsShowOverviewCard fund={fund} />

            <OrganizationsFundsShowDetailsCard organization={activeOrganization} fund={fund} setFund={setFund} />
            <OrganizationsFundsShowRelationsCard organization={activeOrganization} fund={fund} />
        </Fragment>
    );
}
