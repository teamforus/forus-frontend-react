import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { ResponseError } from '../../../props/ApiResponses';
import { useParams } from 'react-router-dom';
import usePushDanger from '../../../hooks/usePushDanger';
import useSetProgress from '../../../hooks/useSetProgress';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import ProviderOrganizationOverview from '../sponsor-provider-organization/elements/ProviderOrganizationOverview';
import type FundProvider from '../../../props/models/FundProvider';
import usePushSuccess from '../../../hooks/usePushSuccess';
import SubsidyFundSponsorProducts from './elements/SubsidyFundSponsorProducts';
import ExtraPaymentIcon from '../../../../../assets/forus-platform/resources/platform-general/assets/img/svg/mollie-connection-icon.svg';
import BudgetFundSponsorProducts from './elements/BudgetFundSponsorProducts';
import BudgetFundProducts from './elements/BudgetFundProducts';
import SubsidyFundProducts from './elements/SubsidyFundProducts';
import Fund from '../../../props/models/Fund';
import useTranslate from '../../../hooks/useTranslate';
import ToggleControl from '../../elements/forms/controls/ToggleControl';

export default function FundProvider() {
    const { fundId, id } = useParams();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);
    const [fundProvider, setFundProvider] = useState<FundProvider>(null);
    const [submittingAllow, setSubmittingAllow] = useState<boolean>(null);

    const updateFundProviderAllow = useCallback(
        (query: { allow_extra_payments?: boolean; allow_extra_payments_full?: boolean }) => {
            setSubmittingAllow(true);

            fundService
                .updateProvider(fundProvider.fund.organization_id, fundProvider.fund.id, fundProvider.id, query)
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    setFundProvider(res.data.data);
                })
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
                .finally(() => setSubmittingAllow(false));
        },
        [fundProvider, fundService, pushDanger, pushSuccess],
    );

    const fetchFundProvider = useCallback(() => {
        setProgress(0);

        fundService
            .readProvider(activeOrganization.id, parseInt(fundId), parseInt(id))
            .then((res) => setFundProvider(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId, id, pushDanger]);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .readPublic(parseInt(fundId))
            .then((res) => setFund(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
            .finally(() => setProgress(100));
    }, [fundId, fundService, pushDanger, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchFundProvider();
    }, [fetchFundProvider]);

    if (!fund || !fundProvider) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'sponsor-provider-organizations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('page_state_titles.organization-providers')}
                </StateNavLink>
                <StateNavLink
                    name={'sponsor-provider-organization'}
                    params={{ id: fundProvider.organization.id, organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {fundProvider.organization.name}
                </StateNavLink>
                <div className="breadcrumb-item active">{fund.name}</div>
            </div>

            <ProviderOrganizationOverview
                organization={fundProvider.organization}
                fundProvider={fundProvider}
                setFundProvider={(data) => setFundProvider(data)}
            />

            {activeOrganization.allow_provider_extra_payments && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-payment-connection form">
                            <div className="connection-content">
                                <div className="connection-content-icon">
                                    <ExtraPaymentIcon />
                                </div>
                                <div className="connection-content-details">
                                    <div className="connection-content-title">
                                        Verbinding met betaalmethode toestaan
                                        {fundProvider.allow_extra_payments ? (
                                            <div className="label label-success">Geaccepteerd</div>
                                        ) : (
                                            <div className="label label-warning">Geweigerd</div>
                                        )}
                                    </div>
                                    <div className="connection-content-info block block-tooltip-details block-tooltip-hover">
                                        Transactiekosten bekijken
                                        <em className="mdi mdi-information" />
                                        <div className="tooltip-content">
                                            <div className="tooltip-text">
                                                Per transactie betaalt u 0,29 cent (excl. btw)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="connection-actions">
                                <ToggleControl
                                    checked={fundProvider.state == 'accepted' && fundProvider.allow_extra_payments}
                                    disabled={submittingAllow || fundProvider.state != 'accepted'}
                                    onChange={(e) => {
                                        updateFundProviderAllow({ allow_extra_payments: e.target.checked });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card-section card-section-primary card-section-narrow form">
                        <div className="card-block card-block-listing card-block-listing-inline card-block-listing-variant">
                            <div className="card-block-listing-label">Betaling met tegoed zonder budget toestaan</div>
                            <ToggleControl
                                checked={fundProvider.allow_extra_payments_full}
                                disabled={submittingAllow || fundProvider.state != 'accepted'}
                                onChange={(e) => {
                                    updateFundProviderAllow({ allow_extra_payments_full: e.target.checked });
                                }}
                            />
                        </div>
                    </div>

                    <div className="card-footer card-footer-warning card-footer-sm">
                        <div className="card-title">
                            <div className="text-small">
                                Wij gebruiken uitsluitend Ideal. Per transactie betaalt u 0,29 cent (excl. btw).
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeOrganization.manage_provider_products && fundProvider.fund.type == 'subsidies' && (
                <SubsidyFundSponsorProducts
                    fundProvider={fundProvider}
                    organization={activeOrganization}
                    onChange={(data) => setFundProvider(data)}
                />
            )}

            {activeOrganization.manage_provider_products && fundProvider.fund.type == 'budget' && (
                <BudgetFundSponsorProducts
                    fundProvider={fundProvider}
                    organization={activeOrganization}
                    onChange={(data) => setFundProvider(data)}
                />
            )}

            {fundProvider.fund.type == 'budget' && (
                <BudgetFundProducts
                    fundProvider={fundProvider}
                    organization={activeOrganization}
                    onChange={(data) => setFundProvider(data)}
                />
            )}

            {fundProvider.fund.type == 'subsidies' && (
                <SubsidyFundProducts
                    fundProvider={fundProvider}
                    organization={activeOrganization}
                    onChange={(data) => setFundProvider(data)}
                />
            )}
        </Fragment>
    );
}
