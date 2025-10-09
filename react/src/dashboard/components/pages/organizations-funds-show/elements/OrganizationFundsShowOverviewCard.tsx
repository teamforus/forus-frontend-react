import FundStateLabels from '../../../elements/resource-states/FundStateLabels';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { hasPermission } from '../../../../helpers/utils';
import React, { useCallback, useMemo } from 'react';
import Fund from '../../../../props/models/Fund';
import ModalNotification from '../../../modals/ModalNotification';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useTranslate from '../../../../hooks/useTranslate';
import { useFundService } from '../../../../services/FundService';
import classNames from 'classnames';
import { Permission } from '../../../../props/models/Organization';

export default function OrganizationFundsShowOverviewCard({
    fund,
    compact = false,
}: {
    fund: Fund;
    compact?: boolean;
}) {
    const activeOrganization = useActiveOrganization();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const navigateState = useNavigateState();

    const fundService = useFundService();

    const canManageFunds = useMemo(() => {
        return hasPermission(activeOrganization, Permission.MANAGE_FUNDS);
    }, [activeOrganization]);

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

    return (
        <div className="card">
            <div className="card-section">
                <div className={classNames('block', 'block-fund', compact && 'block-fund-compact')}>
                    <div className="fund-overview">
                        <div className="fund-media">
                            <img
                                className="fund-media-img"
                                src={fund.logo?.sizes.large || './assets/img/placeholders/fund-thumbnail.png'}
                                alt={''}
                            />
                        </div>

                        <div className="fund-details">
                            <div className="fund-header">
                                <div className="fund-name">{fund.name}</div>
                                <FundStateLabels fund={fund} />
                            </div>

                            <div className="fund-description">
                                {fund.description_short}

                                {compact && (
                                    <StateNavLink
                                        name={'funds-show'}
                                        params={{ organizationId: activeOrganization.id, fundId: fund.id }}
                                        className={'button button-default'}>
                                        <em className="mdi mdi-eye icon-start" />
                                        Open fonds pagina
                                    </StateNavLink>
                                )}
                            </div>
                        </div>
                    </div>

                    {!compact && (
                        <div className="fund-actions">
                            <div className="button-group flex-end">
                                {canManageFunds && fund.fund_form_id && (
                                    <StateNavLink
                                        className="button button-default"
                                        name="fund-form"
                                        params={{ organizationId: activeOrganization.id, id: fund.fund_form_id }}>
                                        <em className="mdi mdi-account-check-outline icon-start" />
                                        {translate('fund_card_sponsor.buttons.criteria')}
                                    </StateNavLink>
                                )}

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

                                {hasPermission(fund.organization, [
                                    Permission.MANAGE_FUNDS,
                                    Permission.MANAGE_FUND_TEXTS,
                                ]) && (
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
                    )}
                </div>
            </div>
        </div>
    );
}
