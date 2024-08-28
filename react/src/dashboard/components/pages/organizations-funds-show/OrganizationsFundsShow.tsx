import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import { useParams } from 'react-router-dom';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import ModalNotification from '../../modals/ModalNotification';
import useOpenModal from '../../../hooks/useOpenModal';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';
import OrganizationsFundsShowDetailsCard from './elements/OrganizationsFundsShowDetailsCard';
import OrganizationsFundsShowRelationsCard from './elements/OrganizationsFundsShowRelationsCard';

export default function OrganizationsFundsShow() {
    const fundId = useParams().fundId;

    const openModal = useOpenModal();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);

    const canManageFunds = useMemo(() => {
        return hasPermission(activeOrganization, 'manage_funds');
    }, [activeOrganization]);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(activeOrganization.id, parseInt(fundId), { stats: 'budget' })
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId]);

    const deleteFund = useCallback(
        (fund: Fund) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    icon={'product-error'}
                    title={translate('fund_card_sponsor.confirm_delete.title')}
                    description={translate('fund_card_sponsor.confirm_delete.description')}
                    buttonCancel={{ onClick: () => modal.close() }}
                    buttonSubmit={{
                        onClick: () => {
                            fundService.destroy(activeOrganization.id, fund.id).then(() => {
                                modal.close();
                                navigateState('organization-funds', { organizationId: activeOrganization.id });
                            });
                        },
                    }}
                />
            ));
        },
        [activeOrganization.id, fundService, navigateState, openModal, translate],
    );

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

            <div className="card">
                <div className="card-section">
                    <div className="block block-fund">
                        <div className="fund-overview">
                            <div className="fund-media">
                                <img
                                    className="fund-media-img"
                                    src={fund.logo?.sizes.thumbnail || './assets/img/placeholders/fund-thumbnail.png'}
                                    alt={''}
                                />
                            </div>

                            <div className="fund-details">
                                <div className="fund-header">
                                    <div className="fund-name">{fund.name}</div>
                                    {fund.state == 'active' && (
                                        <div className="tag tag-success tag-sm">
                                            {translate('components.organization_funds.states.active')}
                                        </div>
                                    )}

                                    {fund.state == 'paused' && (
                                        <div className="tag tag-warning tag-sm">
                                            {translate('components.organization_funds.states.paused')}
                                        </div>
                                    )}

                                    {fund.state == 'closed' && (
                                        <div className="tag tag-default tag-sm">
                                            {translate('components.organization_funds.states.closed')}
                                        </div>
                                    )}
                                </div>

                                <div className="fund-description">{fund.description_short}</div>
                            </div>
                        </div>

                        <div className="fund-actions">
                            <div className="button-group flex-end">
                                {canManageFunds && activeOrganization.allow_2fa_restrictions && (
                                    <StateNavLink
                                        className="button button-default"
                                        name="funds-security"
                                        params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                        <em className="mdi mdi-security icon-start" />
                                        {translate('fund_card_sponsor.buttons.security')}
                                    </StateNavLink>
                                )}

                                {canManageFunds && fund.state == 'waiting' && (
                                    <button className="button button-default" onClick={() => deleteFund(fund)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        Verwijderen
                                    </button>
                                )}

                                {hasPermission(fund.organization, ['manage_funds', 'manage_fund_texts']) && (
                                    <StateNavLink
                                        className="button button-default"
                                        name="funds-edit"
                                        params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                        <em className="mdi mdi-pencil icon-start" />
                                        Bewerken
                                    </StateNavLink>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <OrganizationsFundsShowDetailsCard organization={activeOrganization} fund={fund} setFund={setFund} />
            <OrganizationsFundsShowRelationsCard organization={activeOrganization} fund={fund} />
        </Fragment>
    );
}
