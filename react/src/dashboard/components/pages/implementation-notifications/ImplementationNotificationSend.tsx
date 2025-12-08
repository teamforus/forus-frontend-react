import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData, ResponseError, ResponseErrorData } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import { useNavigateState } from '../../../modules/state_router/Router';
import { hasPermission } from '../../../helpers/utils';
import SelectControl from '../../elements/select-control/SelectControl';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import Paginator from '../../../modules/paginator/components/Paginator';
import SponsorIdentity, { SponsorIdentityCounts } from '../../../props/models/Sponsor/SponsorIdentity';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import useImplementationNotificationService from '../../../services/ImplementationNotificationService';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import SystemNotificationTemplateEditor from './elements/SystemNotificationTemplateEditor';
import SystemNotification from '../../../props/models/SystemNotification';
import useFundIdentitiesExporter from '../../../services/exporters/useFundIdentitiesExporter';
import useTranslate from '../../../hooks/useTranslate';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import usePushApiError from '../../../hooks/usePushApiError';
import { Permission } from '../../../props/models/Organization';
import useConfigurableTable from '../vouchers/hooks/useConfigurableTable';
import TableTopScroller from '../../elements/tables/TableTopScroller';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';

export default function ImplementationNotificationSend() {
    const { id } = useParams();

    const activeOrganization = useActiveOrganization();
    const fundIdentitiesExporter = useFundIdentitiesExporter();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();
    const fundService = useFundService();
    const implementationNotificationsService = useImplementationNotificationService();

    const [fund, setFund] = useState<Fund>(null);
    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [errors, setErrors] = useState<ResponseErrorData>(null);
    const [editing, setEditing] = useState(false);

    const [identities, setIdentities] =
        useState<PaginationData<SponsorIdentity, { counts: SponsorIdentityCounts }>>(null);

    const [submitting, setSubmitting] = useState(false);
    const [perPageKey] = useState('notification_identities');
    const [previewSent, setPreviewSent] = useState(false);
    const [targetGroup, setTargetGroup] = useState('identities');
    const [implementation, setImplementation] = useState<Implementation>(null);
    const [showIdentities, setShowIdentities] = useState(false);
    const [submittingToSelf, setSubmittingToSelf] = useState(false);
    const [lastIdentitiesQuery, setLastIdentitiesQuery] = useState(null);
    const [variableValues, setVariableValues] = useState<{
        fund_name?: string;
        sponsor_name?: string;
    }>(null);

    const [notification] = useState<SystemNotification>(
        implementationNotificationsService.makeCustomNotification(
            'Aanvraag is ontvangen',
            [
                '<h1>:fund_name</h1>',
                '[email_logo]',
                '<br>',
                'Inhoud van de e-mail',
                '<br>',
                'Verander de inhoud van de e-mail',
                '<br>',
                '<br>',
                ':webshop_button',
            ].join('\n'),
        ),
    );

    const [template, setTemplate] = useState(
        notification.templates_default.find((template) => template.type === 'mail'),
    );

    const [identityTargets] = useState([
        { value: 'all', name: 'Alle gebruikers met een actief tegoed' },
        {
            value: 'has_balance',
            name: 'Alle gebruikers met nog beschikbaar resterend tegoed',
        },
    ]);

    const [providerTargets] = useState([
        { value: 'providers_approved', name: 'Alleen geaccepteerde aanbieders' },
        { value: 'providers_rejected', name: 'Alle aanbieders die nog niet geaccepteerd of geweigerd zijn' },
        { value: 'providers_all', name: 'Alle aanbieders' },
    ]);

    const [identitiesFilterValues, identitiesFilterValuesActive, identitiesFilterUpdate, identitiesFilter] =
        useFilterNext<{
            q: string;
            target?: string;
            page?: number;
            per_page?: number;
            order_by?: string;
            order_dir?: string;
        }>(
            {
                q: '',
                target: identityTargets[0].value,
                page: 1,
                per_page: paginatorService.getPerPage(perPageKey),
                order_by: 'id',
                order_dir: 'asc',
            },
            {
                queryParams: {
                    q: StringParam,
                    target: createEnumParam(['all', 'has_balance']),
                    page: NumberParam,
                    per_page: NumberParam,
                    order_by: StringParam,
                    order_dir: StringParam,
                },
            },
        );

    const { resetFilters: resetIdentitiesFilters } = identitiesFilter;

    const [providersFilterValues, providersFilterValuesActive, providersFilterUpdate] = useFilterNext<{
        q: string;
        target?: string;
        per_page?: number;
        order_by?: string;
        order_dir?: string;
    }>({
        q: '',
        target: providerTargets[0].value,
        per_page: paginatorService.getPerPage(perPageKey),
        order_by: 'created_at',
        order_dir: 'desc',
    });

    const { headElement, configsElement } = useConfigurableTable(
        implementationNotificationsService.getIdentitiesColumns(),
        {
            sortable: true,
            filter: identitiesFilter,
        },
    );

    const exportIdentities = useCallback(() => {
        fundIdentitiesExporter.exportData(activeOrganization.id, fund.id, {
            ...identitiesFilterValuesActive,
            with_reservations: 1,
        });
    }, [activeOrganization?.id, fund?.id, fundIdentitiesExporter, identitiesFilterValuesActive]);

    const onTemplateUpdated = useCallback(
        (item: SystemNotification) => {
            const templates = item?.templates || notification?.templates_default;
            const templateItem = templates.find((item) => item.type === 'mail');

            setTemplate((template) => ({
                ...template,
                ...templateItem,
            }));
        },
        [notification?.templates_default],
    );

    const askConfirmation = useCallback(
        (target: string, onConfirm: () => void) => {
            const descriptionKey =
                {
                    all: 'description_identities_all',
                    has_balance: 'description_identities_has_balance',
                    providers_all: 'description_providers_all',
                    providers_approved: 'description_providers_approved',
                    providers_rejected: 'description_providers_rejected',
                }[target] || 'description';

            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.confirm_custom_sponsor_email_notification.title')}
                    description={translate(
                        `modals.danger_zone.confirm_custom_sponsor_email_notification.${descriptionKey}`,
                        {
                            identity_count: identities.meta.counts.selected,
                        },
                    )}
                    buttonCancel={{
                        text: translate('modals.danger_zone.confirm_custom_sponsor_email_notification.buttons.cancel'),
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.confirm_custom_sponsor_email_notification.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            onConfirm();
                        },
                    }}
                />
            ));
        },
        [identities?.meta?.counts?.selected, openModal, translate],
    );

    const askConfirmationToMyself = useCallback(
        (onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.confirm_custom_sponsor_email_notification.title_self')}
                    description={translate(
                        'modals.danger_zone.confirm_custom_sponsor_email_notification.description_self',
                    )}
                    buttonCancel={{
                        text: translate('modals.danger_zone.confirm_custom_sponsor_email_notification.buttons.cancel'),
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.confirm_custom_sponsor_email_notification.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            onConfirm();
                        },
                    }}
                />
            ));
        },
        [openModal, translate],
    );

    const onError = useCallback(
        (err: ResponseError) => {
            pushApiError(err);

            if (err.status === 422) {
                setErrors(err.data.errors);
            }
        },
        [pushApiError],
    );

    const submit = useCallback(() => {
        if (submitting) {
            return false;
        }

        const target =
            targetGroup == 'identities' ? identitiesFilterValuesActive.target : providersFilterValuesActive.target;

        askConfirmation(target, () => {
            setSubmitting(true);
            setProgress(0);

            fundService
                .sendNotification(activeOrganization.id, fund.id, {
                    ...identitiesFilterValuesActive,
                    with_reservations: 1,
                    target: target,
                    subject: implementationNotificationsService.labelsToVars(template.title),
                    content: implementationNotificationsService.labelsToVars(template.content),
                })
                .then(() => {
                    navigateState(DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS, {
                        organizationId: activeOrganization.id,
                        id: implementation.id,
                    });

                    pushSuccess('Gelukt!', 'De e-mail zal zo spoedig mogelijk verstuurd worden naar alle gebruikers.', {
                        timeout: 8000,
                    });
                })
                .catch((res: ResponseError) => {
                    setSubmitting(false);
                    onError(res);
                })
                .finally(() => setProgress(100));
        });
    }, [
        onError,
        fund?.id,
        navigateState,
        submitting,
        fundService,
        pushSuccess,
        setProgress,
        targetGroup,
        askConfirmation,
        template?.title,
        template?.content,
        implementation?.id,
        activeOrganization.id,
        identitiesFilterValuesActive,
        implementationNotificationsService,
        providersFilterValuesActive?.target,
    ]);

    const sendToMyself = useCallback(() => {
        if (submittingToSelf) {
            return;
        }

        askConfirmationToMyself(() => {
            setSubmittingToSelf(true);
            setProgress(0);

            fundService
                .sendNotification(activeOrganization.id, fund.id, {
                    target: 'self',
                    subject: implementationNotificationsService.labelsToVars(template.title),
                    content: implementationNotificationsService.labelsToVars(template.content),
                })
                .then(() => {
                    setPreviewSent(true);
                    pushSuccess('Gelukt!', 'Bekijk de e-mail in je postvak');
                })
                .catch((res: ResponseError) => onError(res))
                .finally(() => {
                    setSubmittingToSelf(false);
                    setProgress(100);
                });
        });
    }, [
        onError,
        fund?.id,
        pushSuccess,
        setProgress,
        fundService,
        template?.title,
        submittingToSelf,
        template?.content,
        activeOrganization.id,
        askConfirmationToMyself,
        implementationNotificationsService,
    ]);

    const updateVariableValues = useCallback(() => {
        if (fund) {
            setVariableValues({
                fund_name: fund.name,
                sponsor_name: fund.organization.name,
            });
        }
    }, [fund]);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => {
                if (!activeOrganization.allow_custom_fund_notifications) {
                    navigateState(DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS, {
                        organizationId: activeOrganization.id,
                        id: res.data.data.id,
                    });
                }

                setImplementation(res.data.data);
            })
            .catch(pushApiError);
    }, [
        id,
        navigateState,
        pushApiError,
        implementationService,
        activeOrganization.id,
        activeOrganization.allow_custom_fund_notifications,
    ]);

    const fetchFunds = useCallback(() => {
        fundService
            .list(activeOrganization.id, { implementation_id: implementation.id, state: 'active' })
            .then((res) => {
                setFunds(res.data.data);
                setFund(res.data.data[0]);
            })
            .catch(pushApiError);
    }, [fundService, activeOrganization.id, implementation?.id, pushApiError]);

    const fetchFundIdentities = useCallback(() => {
        if (fund) {
            setProgress(0);

            fundService
                .listIdentities(activeOrganization.id, fund.id, {
                    ...identitiesFilterValuesActive,
                    with_reservations: 1,
                })
                .then((res) => setIdentities(res.data))
                .catch(pushApiError)
                .finally(() => {
                    setLastIdentitiesQuery(identitiesFilterValuesActive.q);
                    setProgress(100);
                });
        }
    }, [fund, setProgress, fundService, activeOrganization.id, identitiesFilterValuesActive, pushApiError]);

    useEffect(() => {
        if (implementation) {
            fetchFunds();
        }
    }, [fetchFunds, implementation]);

    useEffect(() => {
        if (targetGroup === 'providers') {
            resetIdentitiesFilters();
        }
    }, [resetIdentitiesFilters, targetGroup]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        fetchFundIdentities();
    }, [fetchFundIdentities]);

    useEffect(() => {
        updateVariableValues();
    }, [updateVariableValues]);

    const breadCrumbs = (
        <div className="block block-breadcrumbs">
            <ImplementationsRootBreadcrumbs implementation={implementation} />
            <StateNavLink
                name={DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS}
                params={{ organizationId: activeOrganization.id, id: implementation?.id }}
                activeExact={true}
                className="breadcrumb-item">
                Systeemberichten
            </StateNavLink>
            <div className="breadcrumb-item active">Verstuur een aangepast bericht</div>
        </div>
    );

    if (!implementation || fund === null) {
        return <LoadingCard />;
    }

    if (funds?.length === 0) {
        return (
            <Fragment>
                {breadCrumbs}
                <EmptyCard
                    title={'Geen fondsen beschikbaar'}
                    description={
                        'Er zijn geen fondsen gekoppeld aan deze webshop waarvoor een bericht verstuurd kan worden.'
                    }
                />
            </Fragment>
        );
    }

    return (
        <Fragment>
            {breadCrumbs}

            <div className="form">
                <div className="card">
                    <div className="card-header">
                        <div className="flex flex-grow card-title">
                            <em className="mdi mdi-account-multiple-outline" />
                            Kies een doelgroep
                        </div>
                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                {targetGroup == 'identities' &&
                                    hasPermission(activeOrganization, Permission.MANAGE_VOUCHERS) && (
                                        <div
                                            className="button button-primary button-sm"
                                            onClick={() => setShowIdentities(!showIdentities)}>
                                            <em className="mdi mdi-view-list icon-start" />
                                            {showIdentities
                                                ? 'Verberg de lijst met geadresseerden'
                                                : 'Bekijk de lijst met geadresseerden'}
                                        </div>
                                    )}

                                <div className="block block-label-tabs">
                                    <div className="label-tab-set">
                                        <div
                                            className={`label-tab ${targetGroup === 'identities' ? 'active' : ''}`}
                                            onClick={() => setTargetGroup('identities')}>
                                            <div className="mdi mdi-account-multiple-outline label-tab-icon-start" />
                                            Aanvragers
                                        </div>
                                        <div
                                            className={`label-tab ${targetGroup === 'providers' ? 'active' : ''}`}
                                            onClick={() => setTargetGroup('providers')}>
                                            <div className="mdi mdi-store-outline label-tab-icon-start" />
                                            Aanbieders
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-section">
                        <div className="form-group">
                            <label className="form-label">Kies een fonds</label>

                            <SelectControl
                                className="form-control"
                                allowSearch={false}
                                value={fund}
                                onChange={(value: Fund) => setFund(value)}
                                options={funds}
                            />
                        </div>

                        {targetGroup == 'identities' && (
                            <div className="form-group">
                                <label className="form-label">Verstuur naar</label>

                                <SelectControl
                                    className="form-control"
                                    propKey={'value'}
                                    allowSearch={false}
                                    value={identitiesFilterValues.target}
                                    onChange={(value: string) => {
                                        identitiesFilterUpdate({ target: value });
                                    }}
                                    options={identityTargets}
                                />
                            </div>
                        )}

                        {targetGroup == 'providers' && (
                            <div className="form-group">
                                <label className="form-label">Verstuur naar</label>

                                <SelectControl
                                    className="form-control"
                                    propKey={'value'}
                                    allowSearch={false}
                                    value={providersFilterValues.target}
                                    onChange={(value: string) => {
                                        providersFilterUpdate({ target: value });
                                    }}
                                    options={providerTargets}
                                />
                            </div>
                        )}
                    </div>

                    {targetGroup == 'identities' && identities && (
                        <div>
                            {showIdentities && (
                                <div className="card-header">
                                    <div className="flex flex-grow">
                                        <div className="card-title">
                                            <em className="mdi mdi-view-list" />
                                            Lijst met geadresseerden
                                        </div>
                                    </div>
                                    <div className="card-header-filters">
                                        <div className="block block-inline-filters">
                                            <div className="form">
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        value={identitiesFilterValues.q}
                                                        placeholder="Zoeken"
                                                        className="form-control"
                                                        onChange={(e) => identitiesFilterUpdate({ q: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                className="button button-primary button-sm"
                                                onClick={() => exportIdentities()}>
                                                <em className="mdi mdi-download icon-start" />
                                                Exporteren
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showIdentities && identities.meta.total > 0 && (
                                <div className="card-section">
                                    <div className="card-block card-block-table">
                                        {configsElement}

                                        <TableTopScroller>
                                            <table className="table">
                                                {headElement}

                                                <tbody>
                                                    {identities.data.map((identity) => (
                                                        <tr key={identity.id}>
                                                            <td>{identity.id}</td>
                                                            <td>{identity.email}</td>
                                                            <td>{identity.count_vouchers}</td>
                                                            <td>{identity.count_vouchers_active}</td>
                                                            <td>{identity.count_vouchers_active_with_balance}</td>
                                                            <td className={'table-td-actions text-right'}>
                                                                <TableEmptyValue />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </TableTopScroller>
                                    </div>
                                </div>
                            )}

                            {showIdentities && identities.meta.total == 0 && (
                                <EmptyCard
                                    type={'card-section'}
                                    title={
                                        lastIdentitiesQuery
                                            ? `Geen gebruikers gevonden voor "${lastIdentitiesQuery}"`
                                            : 'Geen gebruikers gevonden'
                                    }
                                />
                            )}

                            {showIdentities && identities && identities?.meta && (
                                <div className="card-section card-section-narrow">
                                    <Paginator
                                        meta={identities.meta}
                                        filters={identitiesFilterValues}
                                        updateFilters={identitiesFilterUpdate}
                                        perPageKey={perPageKey}
                                    />
                                </div>
                            )}

                            <div className="card-section card-section-primary">
                                <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                                    <div className="keyvalue-item col col-lg-3">
                                        <div className="keyvalue-key">Met tegoeden</div>
                                        <div className="keyvalue-value">
                                            <span>{identities.meta.counts.active}</span>
                                            <span className="icon mdi mdi-account-multiple-outline" />
                                        </div>
                                    </div>
                                    <div className="keyvalue-item col col-lg-3">
                                        <div className="keyvalue-key">Binnen de doelgroep</div>
                                        <div className="keyvalue-value">
                                            <span>{identities.meta.counts.selected}</span>
                                            <span className="icon mdi mdi-account-multiple-check-outline" />
                                        </div>
                                    </div>
                                    <div className="keyvalue-item col col-lg-3">
                                        <div className="keyvalue-key">Uitgesloten gebruikers</div>
                                        <div className="keyvalue-value">
                                            <span>
                                                {identities.meta.counts.active -
                                                    identities.meta.counts.selected -
                                                    identities.meta.counts.without_email}
                                            </span>
                                            <span className="icon mdi mdi-account-multiple-remove-outline" />
                                        </div>
                                    </div>
                                    <div className="keyvalue-item col col-lg-3">
                                        <div className="keyvalue-key">Zonder e-mailadres</div>
                                        <div className="keyvalue-value">
                                            <span>{identities.meta.counts.without_email}</span>
                                            <span className="icon mdi mdi-email-off-outline" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="block block-system-notification-editor">
                    {template && variableValues && (
                        <SystemNotificationTemplateEditor
                            type="mail"
                            implementation={implementation}
                            organization={activeOrganization}
                            fund={fund}
                            notification={notification}
                            template={template}
                            onEditUpdated={(editing) => setEditing(editing)}
                            onChange={(notification) => onTemplateUpdated(notification)}
                            errors={errors}
                            compose={true}
                            variableValues={variableValues}
                        />
                    )}
                </div>

                {!editing && (
                    <div className="card">
                        <div className="card-section card-section-narrow">
                            <div className="button-group flex-center">
                                <StateNavLink
                                    name={DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS}
                                    params={{ organizationId: activeOrganization.id, id: implementation?.id }}
                                    className="button button-default">
                                    <em className="mdi mdi-close icon-start" />
                                    Annuleren
                                </StateNavLink>

                                <button
                                    className="button button-default"
                                    type="button"
                                    onClick={() => sendToMyself()}
                                    disabled={submittingToSelf || submitting}>
                                    {submittingToSelf ? (
                                        <em className="mdi mdi-loading mdi-spin icon-start" />
                                    ) : (
                                        <em className="mdi mdi-account-arrow-right-outline icon-start" />
                                    )}
                                    Verstuur een test e-mail naar jezelf
                                </button>
                                <button
                                    className="button button-primary"
                                    type="button"
                                    onClick={() => submit()}
                                    disabled={!previewSent || submittingToSelf || submitting}>
                                    {submitting ? (
                                        <em className="mdi mdi-loading mdi-spin icon-start" />
                                    ) : (
                                        <em className="mdi mdi-send-outline icon-start" />
                                    )}
                                    Versturen
                                </button>
                            </div>
                        </div>

                        {!previewSent && (
                            <div className="card-section card-section-narrow card-section card-section-warning text-center">
                                Voordat je de e-mail naar de doelgroep kunt versturen, dien je eerst een test-e-mail
                                naar jezelf te sturen.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Fragment>
    );
}
