import React, { Fragment, useCallback, useMemo } from 'react';
import Fund from '../../../../props/models/Fund';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import { useNavigateState } from '../../../../modules/state_router/Router';
import ModalFundInviteProviders from '../../../modals/ModalFundInviteProviders';
import { hasPermission } from '../../../../helpers/utils';
import Organization from '../../../../props/models/Organization';
import useTranslate from '../../../../hooks/useTranslate';
import useOpenModal from '../../../../hooks/useOpenModal';
import usePushSuccess from '../../../../hooks/usePushSuccess';

export default function OrganizationsFundsShowStatisticsCard({
    fund,
    organization,
}: {
    fund: Fund;
    organization: Organization;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();

    const canInviteProviders = useMemo(() => {
        return hasPermission(organization, 'manage_funds') && fund?.state != 'closed';
    }, [organization, fund?.state]);

    const providersDescription = useMemo(() => {
        return [
            `${fund?.provider_organizations_count}`,
            `(${fund?.provider_employees_count} ${translate('fund_card_sponsor.labels.employees')})`,
        ].join(' ');
    }, [fund?.provider_employees_count, fund?.provider_organizations_count, translate]);

    const canAccessFund = useMemo(() => {
        return fund?.state != 'closed';
    }, [fund]);

    const inviteProvider = useCallback(
        (fund: Fund) => {
            if (!canInviteProviders) {
                return;
            }

            openModal((modal) => (
                <ModalFundInviteProviders
                    fund={fund}
                    modal={modal}
                    onSubmit={(res) => {
                        pushSuccess(
                            'Aanbieders uitgenodigd!',
                            `${res.length} uitnodigingen verstuurt naar aanbieders!`,
                        );

                        setTimeout(() => document.location.reload(), 2000);
                    }}
                />
            ));
        },
        [openModal, pushSuccess, canInviteProviders],
    );

    return (
        <Fragment>
            {fund.is_configured && (
                <div className="card-section card-section-warning">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                        <a className="keyvalue-item col col-lg-3">
                            <div className="keyvalue-key">{translate('fund_card_sponsor.labels.your_employees')}</div>
                            <div
                                className="keyvalue-value"
                                onClick={() => {
                                    navigateState('employees', { organizationId: fund.organization_id });
                                }}>
                                <span>{fund.sponsor_count}</span>
                                <span className="icon mdi mdi-account-multiple-plus" />
                            </div>
                        </a>

                        <div
                            className={`keyvalue-item col col-lg-3 ${
                                !canInviteProviders ? 'keyvalue-item-disabled' : ''
                            }`}
                            onClick={() => inviteProvider(fund)}>
                            <div className="keyvalue-key">{translate('fund_card_sponsor.labels.providers')}</div>
                            <div className="keyvalue-value">
                                <span>{providersDescription}</span>
                                <em className="icon mdi mdi-account-multiple-plus" />
                            </div>
                        </div>

                        <a
                            className={`keyvalue-item col col-lg-3 ${!canAccessFund ? 'keyvalue-item-disabled' : ''}`}
                            onClick={() => {
                                navigateState('csv-validation', { fundId: fund.organization_id });
                            }}>
                            <div className="keyvalue-key">{translate('fund_card_sponsor.labels.applicants')}</div>
                            <div className="keyvalue-value">
                                <span>{fund.requester_count}</span>
                                {canAccessFund && <span className="icon mdi mdi-account-multiple-plus" />}
                            </div>
                        </a>
                    </div>
                </div>
            )}

            {fund.budget ? (
                <div className="card-section card-section-primary">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                        <div className="keyvalue-item col col-lg-3">
                            <div className="keyvalue-key">Gestort</div>
                            <div className="keyvalue-value">{fund.budget.total_locale}</div>
                        </div>

                        <div className="keyvalue-item col col-lg-3">
                            <div className="keyvalue-key">Gebruikt</div>
                            <div className="keyvalue-value">{fund.budget.used_locale}</div>
                        </div>

                        <div className="keyvalue-item col col-lg-3">
                            <div className="keyvalue-key">Resterend</div>
                            <div className="keyvalue-value">{fund.budget.left_locale}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyCard title={'Geen statistieken'} type={'card-section'} />
            )}
        </Fragment>
    );
}
