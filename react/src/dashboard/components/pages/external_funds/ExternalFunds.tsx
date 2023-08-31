import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { PaginationData } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useFilters from '../../../hooks/useFilters';
import { useOrganizationService } from '../../../services/OrganizationService';
import { mainContext } from '../../../contexts/MainContext';
import Paginator from '../../../modules/paginator/components/Paginator';
import ExternalFund from '../../../props/models/ExternalFund';
import ModalDangerZone from '../../modals/ModalDangerZone';
import { useTranslation } from 'react-i18next';
import useOpenModal from '../../../hooks/useOpenModal';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useThumbnailUrl from '../../../hooks/useThumbnailUrl';

export default function ExternalFunds() {
    const { setActiveOrganization } = useContext(mainContext);

    const thumbnailUrl = useThumbnailUrl();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const activeOrganization = useActiveOrganization();

    const [funds, setFunds] = useState<PaginationData<ExternalFund>>(null);
    const filters = useFilters({});
    const organizationService = useOrganizationService();
    const { t } = useTranslation();

    const fetchFunds = useCallback(() => {
        setProgress(0);

        organizationService
            .listExternalFunds(activeOrganization.id, filters.activeValues)
            .then((res) => setFunds(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, organizationService, activeOrganization.id, filters.activeValues]);

    const askConfirmation = useCallback(
        (onConfirm) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_external_validators.title')}
                    description={t('modals.danger_zone.remove_external_validators.description')}
                    buttonSubmit={{
                        text: t('modals.danger_zone.remove_external_validators.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            onConfirm();
                        },
                    }}
                    buttonCancel={{
                        text: t('modals.danger_zone.remove_external_validators.buttons.cancel'),
                        onClick: modal.close,
                    }}
                />
            ));
        },
        [openModal, t],
    );

    const updateFundAcceptance = useCallback(
        (fund) => {
            setProgress(0);

            organizationService
                .externalFundUpdate(activeOrganization.id, fund.id, {
                    criteria: fund.criteria,
                })
                .then(
                    () => {
                        fetchFunds();
                        pushSuccess('Opgeslagen!');
                    },
                    () => {
                        pushDanger('Error!');
                    },
                )
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, fetchFunds, organizationService, pushDanger, pushSuccess, setProgress],
    );

    const acceptFundCriterion = useCallback(
        (fund, criterion) => {
            criterion.accepted = true;
            updateFundAcceptance(fund);
        },
        [updateFundAcceptance],
    );

    const declineFundCriterion = useCallback(
        (fund: ExternalFund, criterion) => {
            askConfirmation(() => {
                criterion.accepted = false;
                updateFundAcceptance(fund);
            });
        },
        [askConfirmation, updateFundAcceptance],
    );

    const acceptAll = useCallback(
        (fund: ExternalFund) => {
            fund.criteria.forEach((criterion) => (criterion.accepted = true));
            updateFundAcceptance(fund);
        },
        [updateFundAcceptance],
    );

    const declineAll = useCallback(
        (fund: ExternalFund) => {
            askConfirmation(() => {
                fund.criteria.forEach((criterion) => (criterion.accepted = false));
                updateFundAcceptance(fund);
            });
        },
        [askConfirmation, updateFundAcceptance],
    );

    const updateActiveOrganization = useCallback(
        (organization, values) => {
            setProgress(0);

            organizationService
                .updateRole(organization.id, values)
                .then(
                    (res) => {
                        pushSuccess('Opgeslagen!');
                        setActiveOrganization(res.data.data);
                    },
                    (res) => {
                        pushDanger('Error!', res.data.message);
                    },
                )
                .then(() => setProgress(100));
        },
        [organizationService, pushDanger, pushSuccess, setActiveOrganization, setProgress],
    );

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!funds) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading">
                <div className="flex-row">
                    <div className="flex-col">Fundsen</div>
                    <div className="flex-col text-right form">
                        <div className="flex-row">
                            <div className="flex-col flex-grow">
                                <label className="form-label" htmlFor="auto_validate">
                                    Accepteer automatisch
                                </label>
                            </div>
                            <div className="flex-col">
                                <label className="label form-toggle flex-end" htmlFor="auto_validate">
                                    <input
                                        type="checkbox"
                                        id="auto_validate"
                                        checked={!!activeOrganization.validator_auto_accept_funds}
                                        onChange={(e) => {
                                            updateActiveOrganization(activeOrganization, {
                                                validator_auto_accept_funds: e.target.checked,
                                            });
                                        }}
                                    />
                                    <div className="form-toggle-inner flex-end">
                                        <div className="toggle-input">
                                            <div className="toggle-input-dot"></div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {funds?.meta.total == 0 && <EmptyCard description="Geen fondsen beschikbaar." />}

            {funds.data.map((fund) => (
                <div key={fund.id} className={'card'}>
                    <div className="card-section">
                        <div className="card-section-actions">
                            <div className="tag tag-success">Actief</div>
                        </div>
                        <div className="card-block card-block-fund">
                            <div className="fund-img">
                                <img alt={''} src={fund.logo?.sizes?.thumbnail || thumbnailUrl('fund')} />
                            </div>
                            <div className="fund-title">{fund.name}</div>
                            <br />
                            <div className="fund-organization">{fund.organization}</div>
                        </div>
                    </div>
                    <div className="card-section">
                        <div className="form">
                            <div className="block block-card-toggleable">
                                <div className="block-title">Fonds zijn criteria</div>
                                {fund.criteria.map((criterion) => (
                                    <div key={criterion.id} className="card-toggleable">
                                        <label htmlFor={`option_${criterion.id}`} className="card-toggleable-label">
                                            {criterion.name}
                                        </label>

                                        {criterion.accepted ? (
                                            <div
                                                className="button button-default"
                                                onClick={() => declineFundCriterion(fund, criterion)}>
                                                <em className="mdi mdi-close icon-start" />
                                                Weiger
                                            </div>
                                        ) : (
                                            <div
                                                className="button button-primary"
                                                onClick={() => acceptFundCriterion(fund, criterion)}>
                                                <em className="mdi mdi-check-circle icon-start" />
                                                Accepteer
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="card-section card-section-primary text-right">
                        {fund.criteria.find((fund) => fund.accepted) && (
                            <button className="button button-default" onClick={() => declineAll(fund)}>
                                <em className="mdi mdi-close icon-start" />
                                Weiger alles
                            </button>
                        )}

                        {fund.criteria.find((fund) => !fund.accepted) && (
                            <button className="button button-primary" onClick={() => acceptAll(fund)}>
                                <em className="mdi mdi-plus-circle icon-start" />
                                Accepteer alles
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {funds.meta.last_page > 1 && (
                <div className="card">
                    <div className="card-section">
                        <Paginator meta={funds.meta} filters={filters.activeValues} updateFilters={filters.update} />
                    </div>
                </div>
            )}
        </Fragment>
    );
}
