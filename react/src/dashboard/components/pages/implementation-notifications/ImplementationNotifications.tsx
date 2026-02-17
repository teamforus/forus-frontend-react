import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { PaginationData } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import { groupBy } from 'lodash';
import useImplementationNotificationService from '../../../services/ImplementationNotificationService';
import SystemNotification from '../../../props/models/SystemNotification';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import Label from '../../elements/label/Label';
import TableRowActions from '../../elements/tables/TableRowActions';
import InfoBox from '../../elements/info-box/InfoBox';
import { useParams } from 'react-router';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';

export default function ImplementationNotifications() {
    const { id } = useParams();
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const pushApiError = usePushApiError();

    const implementationService = useImplementationService();
    const implementationNotificationsService = useImplementationNotificationService();

    const [channels] = useState<Array<'mail' | 'push' | 'database'>>(['mail', 'push', 'database']);
    const [notifications, setNotifications] = useState<PaginationData<SystemNotification>>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const [groupLabels] = useState({
        requester_fund_request: 'Deelnemers aanvraag en beoordeling',
        requester_vouchers: 'Deelnemers tegoeden',
        requester_transactions: 'Deelnemers reserveringen en transacties',
        provider_fund_requests: 'Aanbieder aanvraag en beoordeling',
        requester_reimbursements: 'Declaraties',
        provider_voucher_and_transactions: 'Aanbieder reserveringen en transacties',
        sponsor: 'Sponsor',
        other: 'Overig',
    });

    const notificationGroups = useMemo(() => {
        if (!notifications) {
            return null;
        }

        const groupOrder = Object.keys(groupLabels);

        const list = notifications?.data?.map((notification) => ({
            ...notification,
            state: implementationNotificationsService.notificationToStateLabel(notification),
            title: translate(`system_notifications.notifications.${notification.key}.title`),
            description: translate(`system_notifications.notifications.${notification.key}.description`),
        }));

        const grouped = groupBy(list, 'group');

        return Object.keys(grouped)
            .map((group) => ({ group, groupLabel: groupLabels[group], notifications: grouped[group] }))
            .map((item) => ({ ...item, notifications: item.notifications.sort((a, b) => a.order - b.order) }))
            .sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));
    }, [translate, groupLabels, notifications, implementationNotificationsService]);

    const notificationIconColor = useCallback(
        (notification: SystemNotification, type: 'database' | 'mail' | 'push') => {
            const templateChanged = notification.templates.filter((item) => item.type == type).length > 0;

            if (!notification.channels.includes(type)) {
                return 'text-muted-light';
            }

            if (!notification.enable_all || !notification['enable_' + type]) {
                return 'text-danger-dark';
            }

            return templateChanged ? 'text-primary-dark' : 'text-success-dark';
        },
        [],
    );

    const notificationIcon = useCallback((notification: SystemNotification, type: 'database' | 'mail' | 'push') => {
        const iconOff = {
            mail: 'email-off-outline',
            push: 'cellphone-off',
            database: 'bell-off-outline',
        }[type];

        const iconsOn = {
            mail: 'email',
            push: 'cellphone',
            database: 'bell',
        }[type];

        if (!notification.channels.includes(type) || !notification.enable_all || !notification['enable_' + type]) {
            return iconOff;
        }

        return iconsOn;
    }, []);

    const notificationIconTooltip = useCallback(
        (notification: SystemNotification, type: 'database' | 'mail' | 'push') => {
            const heading = translate(`system_notifications.types.${type}.title`);
            const templateChanged = notification.templates.filter((item) => item.type == type).length > 0;

            if (!notification.channels.includes(type)) {
                return { heading, text: translate(`system_notifications.tooltips.channel_not_available`) };
            }

            if (!notification.enable_all || !notification[`enable_${type}`]) {
                return { heading, text: translate(`system_notifications.tooltips.disabled_by_you`) };
            }

            return {
                heading,
                text: translate(
                    'system_notifications.tooltips.' + (templateChanged ? 'enabled_edited' : 'enabled_default'),
                ),
            };
        },
        [translate],
    );

    const fetchImplementationNotifications = useCallback(() => {
        implementationNotificationsService
            .list(activeOrganization.id, implementation.id)
            .then((res) => setNotifications(res.data))
            .catch(pushApiError);
    }, [implementationNotificationsService, activeOrganization.id, implementation?.id, pushApiError]);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch(pushApiError);
    }, [activeOrganization.id, id, pushApiError, implementationService]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        if (implementation) {
            fetchImplementationNotifications();
        }
    }, [fetchImplementationNotifications, implementation]);

    if (!implementation || !notificationGroups) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">Systeemberichten</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title flex flex-grow">Systeemberichten</div>
                    <div className={'card-header-filters'}>
                        <div className="block block-inline-filters">
                            {activeOrganization.allow_custom_fund_notifications && (
                                <StateNavLink
                                    name={DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS_SEND}
                                    params={{
                                        id: implementation.id,
                                        organizationId: activeOrganization.id,
                                    }}
                                    className="button button-default">
                                    <em className="mdi mdi-email-outline icon-start" />
                                    Verstuur een aangepast bericht
                                </StateNavLink>
                            )}

                            <StateNavLink
                                name={DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS_BRANDING}
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: implementation.id,
                                }}
                                className="button button-primary">
                                <em className="mdi mdi-cog-outline icon-start" />
                                Handtekening en huisstijl
                            </StateNavLink>
                        </div>
                    </div>
                </div>
                <div className="card-section flex flex-gap">
                    <InfoBox>{translate('system_notifications.header.tooltip')}</InfoBox>
                </div>
            </div>

            {notificationGroups.map((notificationGroup, index) => (
                <div className="card card-collapsed" key={index}>
                    <div className="card-header">
                        <div className="card-title">{notificationGroup.groupLabel}</div>
                    </div>
                    <LoaderTableCard columns={implementationNotificationsService.getColumns()}>
                        {notificationGroup.notifications.map((notification) => (
                            <StateNavLink
                                key={notification.id}
                                name={DashboardRoutes.IMPLEMENTATION_NOTIFICATION_EDIT}
                                params={{
                                    organizationId: activeOrganization.id,
                                    implementationId: implementation.id,
                                    id: notification.id,
                                }}
                                customElement={'tr'}
                                className={'tr-clickable'}>
                                <td className="td-grow">
                                    <div>
                                        {notification.editable ? (
                                            <em className="mdi mdi-pencil-outline text-muted-dark"> </em>
                                        ) : (
                                            <em className="mdi mdi-lock-outline text-muted-dark"> </em>
                                        )}
                                        <span>{notification.title}</span>
                                    </div>
                                    <small>{notification.description}</small>
                                </td>
                                <td className="nowrap">
                                    <div className="td-icons">
                                        {channels.map((channel, index) => (
                                            <em
                                                key={index}
                                                className={`block block-tooltip-details block-tooltip-hover mdi mdi-${notificationIcon(
                                                    notification,
                                                    channel,
                                                )} ${notificationIconColor(notification, channel)}`}>
                                                <div className="tooltip-content tooltip-content-fit tooltip-content-ghost">
                                                    <div className="tooltip-heading text-left">
                                                        {notificationIconTooltip(notification, channel).heading}
                                                    </div>
                                                    <div className="tooltip-text text-left">
                                                        {notificationIconTooltip(notification, channel).text}
                                                    </div>
                                                </div>
                                            </em>
                                        ))}
                                    </div>
                                </td>

                                <td className="nowrap">
                                    {notification.state?.state === 'active' && (
                                        <Label type="success">{notification.state.stateLabel}</Label>
                                    )}

                                    {notification.state?.state === 'inactive' && (
                                        <Label type="danger">{notification.state.stateLabel}</Label>
                                    )}

                                    {notification.state?.state === 'active_partly' && (
                                        <Label type="warning">{notification.state.stateLabel}</Label>
                                    )}

                                    {!['active', 'inactive', 'active_partly'].includes(notification.state?.state) && (
                                        <Label type="default">{notification.state.stateLabel}</Label>
                                    )}
                                </td>

                                <td className={'td-narrow text-right'}>
                                    <TableRowActions
                                        content={() => (
                                            <div className="dropdown dropdown-actions">
                                                <StateNavLink
                                                    name={DashboardRoutes.IMPLEMENTATION_NOTIFICATION_EDIT}
                                                    params={{
                                                        organizationId: activeOrganization.id,
                                                        implementationId: implementation.id,
                                                        id: notification.id,
                                                    }}
                                                    className="dropdown-item">
                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                    Bekijken
                                                </StateNavLink>
                                            </div>
                                        )}
                                    />
                                </td>
                            </StateNavLink>
                        ))}
                    </LoaderTableCard>
                </div>
            ))}
        </Fragment>
    );
}
