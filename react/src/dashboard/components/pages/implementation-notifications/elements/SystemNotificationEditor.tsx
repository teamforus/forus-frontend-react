import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import ToggleControl from '../../../elements/forms/controls/ToggleControl';
import useImplementationNotificationService from '../../../../services/ImplementationNotificationService';
import { keyBy } from 'lodash';
import Implementation from '../../../../props/models/Implementation';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import SystemNotification from '../../../../props/models/SystemNotification';
import SelectControl from '../../../elements/select-control/SelectControl';
import SystemNotificationTemplateEditor from './SystemNotificationTemplateEditor';
import Fund from '../../../../props/models/Fund';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import SystemNotificationFundState from '../../../../props/models/SystemNotificationFundState';
import SystemNotificationStatusLabel from './SystemNotificationStatusLabel';

export default function SystemNotificationEditor({
    notification,
    organization,
    implementation,
    setNotifications,
}: {
    notification: SystemNotification;
    organization: Organization;
    implementation: Implementation;
    setNotifications: React.Dispatch<React.SetStateAction<SystemNotification>>;
}) {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const implementationNotificationsService = useImplementationNotificationService();

    const [fund, setFund] = useState<Partial<Fund>>(null);
    const [notificationToggleLabels] = useState({
        disabled: `Uitgezet, alle kanalen zijn uitgezet.`,
        enabled_all: 'Aangezet, alle kanalen zijn aangezet.',
        enabled_partial: 'Aangezet, sommige kanalen staan afzonderlijk uit.',
    });

    const funds = useMemo<Array<Partial<Fund>>>(() => {
        if (!implementation.allow_per_fund_notification_templates) {
            return [];
        }

        return [
            { id: null, name: 'Alle fondsen' },
            ...(notification.funds || []).map((fundState) => ({
                id: fundState.id,
                name: fundState.name,
            })),
        ];
    }, [implementation.allow_per_fund_notification_templates, notification.funds]);

    const fundState = useMemo<SystemNotificationFundState>(() => {
        return notification.funds?.find((fundState) => fundState.id === fund?.id) || null;
    }, [fund?.id, notification.funds]);

    const currentNotification = useMemo<SystemNotification>(() => {
        if (!fundState) {
            return notification;
        }

        return {
            ...notification,
            enable_all: notification.enable_all && fundState.enable_all,
            enable_mail: notification.enable_mail && fundState.enable_mail,
            enable_push: notification.enable_push && fundState.enable_push,
            enable_database: notification.enable_database && fundState.enable_database,
            last_sent_date: fundState.last_sent_date,
            last_sent_date_locale: fundState.last_sent_date_locale,
        };
    }, [fundState, notification]);

    const templates = useMemo(() => {
        const channels: {
            mail?: boolean;
            push?: boolean;
            database?: boolean;
        } = notification.channels.reduce((obj, channel) => ({ ...obj, [channel]: true }), {});

        const templatesFund = fund?.id
            ? implementationNotificationsService.templatesToFront(
                  notification.templates.filter((template) => template.fund_id == fund?.id),
              )
            : [];

        const templatesImplementation = implementationNotificationsService.templatesToFront(
            notification.templates.filter((template) => !template.fund_id),
        );

        const templatesDefault = implementationNotificationsService.templatesToFront(notification.templates_default);

        return {
            mail: channels.mail
                ? keyBy(templatesFund, 'type')?.mail ||
                  keyBy(templatesImplementation, 'type')?.mail ||
                  keyBy(templatesDefault, 'type')?.mail
                : null,
            push: channels.push
                ? keyBy(templatesFund, 'type')?.push ||
                  keyBy(templatesImplementation, 'type')?.push ||
                  keyBy(templatesDefault, 'type')?.push
                : null,
            database: channels.database
                ? keyBy(templatesFund, 'type')?.database ||
                  keyBy(templatesImplementation, 'type')?.database ||
                  keyBy(templatesDefault, 'type').database
                : null,
        };
    }, [
        fund?.id,
        implementationNotificationsService,
        notification.channels,
        notification.templates,
        notification.templates_default,
    ]);

    useEffect(() => {
        setFund(null);
    }, [notification.id]);

    const toggleSwitched = useCallback(() => {
        setProgress(0);

        const data = { enable_all: fundState ? !fundState.enable_all : !notification.enable_all };
        const hasDisabledChannels =
            implementationNotificationsService.notificationHasDisabledChannels(currentNotification);

        const message = data.enable_all
            ? hasDisabledChannels
                ? notificationToggleLabels.enabled_partial
                : notificationToggleLabels.enabled_all
            : notificationToggleLabels.disabled;

        implementationNotificationsService
            .update(organization.id, implementation.id, notification.id, {
                ...data,
                ...(fund?.id ? { fund_id: fund.id } : {}),
            })
            .then((res) => {
                setNotifications(res.data.data);
                pushSuccess('Opgeslagen', message);
            })
            .finally(() => setProgress(100));
    }, [
        setNotifications,
        setProgress,
        pushSuccess,
        notification,
        organization.id,
        implementation.id,
        fund?.id,
        fundState,
        currentNotification,
        implementationNotificationsService,
        notificationToggleLabels.disabled,
        notificationToggleLabels.enabled_all,
        notificationToggleLabels.enabled_partial,
    ]);

    if (!templates || !notification) {
        return <LoadingCard />;
    }

    return (
        <div className="block block-system-notification-editor">
            <div className="card card-collapsed">
                <div className={classNames('card-header', !currentNotification.enable_all && 'card-header-danger')}>
                    <div
                        className={classNames(
                            'flex',
                            'flex-grow',
                            'card-title',
                            !currentNotification.enable_all && 'text-muted-dark',
                        )}>
                        <em className="mdi mdi-web" />
                        <span>{translate(`system_notifications.notifications.${notification.key}.title`)}</span>
                    </div>
                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <ToggleControl
                                id={'enable_all'}
                                className="form-toggle-danger"
                                checked={notification.optional ? currentNotification.enable_all : true}
                                title={
                                    notification.optional
                                        ? currentNotification.enable_all
                                            ? ''
                                            : notificationToggleLabels.disabled
                                        : 'Verplicht'
                                }
                                disabled={
                                    !notification.editable ||
                                    !notification.optional ||
                                    Boolean(fundState && !notification.enable_all)
                                }
                                onChange={
                                    notification.editable &&
                                    notification.optional &&
                                    !(fundState && !notification.enable_all)
                                        ? toggleSwitched
                                        : null
                                }
                                labelRight={false}
                            />
                        </div>
                    </div>
                </div>

                {funds && funds.length > 0 && (
                    <div
                        className={classNames(
                            'card-section',
                            !currentNotification.enable_all && 'card-section-danger',
                        )}>
                        <div className="card-block card-block-keyvalue">
                            <div className="keyvalue-item flex">
                                <div className="keyvalue-key text-right flex flex-vertical flex-center">
                                    <div className="text-strong">Kies een fonds</div>
                                </div>
                                <div className="keyvalue-value">
                                    <div className="col col-xs-12 col-lg-8">
                                        <SelectControl
                                            className="form-control"
                                            placeholder="Kies een fonds"
                                            options={funds}
                                            value={fund}
                                            allowSearch={true}
                                            onChange={(fund: Partial<Fund>) => setFund(fund)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className={classNames(
                        'card-section',
                        notification.optional && !currentNotification.enable_all && 'card-section-danger',
                    )}>
                    <div className="card-block card-block-keyvalue">
                        <div className="keyvalue-item">
                            <div className="keyvalue-key text-right">
                                <div className="text-strong">Status</div>
                            </div>
                            <div className="keyvalue-value">
                                <SystemNotificationStatusLabel notification={notification} fundState={fundState} />
                            </div>
                        </div>
                        <div className="keyvalue-item">
                            <div className="keyvalue-key text-right">
                                <div className="text-strong">Beschrijving</div>
                            </div>
                            <div className="keyvalue-value">
                                {translate(`system_notifications.notifications.${notification.key}.description`)}
                            </div>
                        </div>
                        <div className="keyvalue-item">
                            <div className="keyvalue-key text-right">
                                <div className="text-strong">Aanspreekvorm</div>
                            </div>
                            <div className="keyvalue-value">
                                {implementation.informal_communication ? 'Je/jouw' : 'U/uw'}
                            </div>
                        </div>

                        {notification.key === 'notifications_identities.voucher_expire_soon_budget' && (
                            <div className="keyvalue-item">
                                <div className="keyvalue-key text-right">
                                    <div className="text-strong">Laatste datum</div>
                                </div>
                                <div className="keyvalue-value">
                                    {currentNotification?.last_sent_date_locale || <TableEmptyValue />}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {templates.mail && (
                <SystemNotificationTemplateEditor
                    type="mail"
                    fund={fund}
                    implementation={implementation}
                    organization={organization}
                    notification={currentNotification}
                    implementationNotification={notification}
                    fundState={fundState}
                    template={templates.mail}
                    onChange={(data) => setNotifications({ ...notification, ...data })}
                />
            )}

            {templates.push && (
                <SystemNotificationTemplateEditor
                    type="push"
                    implementation={implementation}
                    organization={organization}
                    fund={fund}
                    notification={currentNotification}
                    implementationNotification={notification}
                    fundState={fundState}
                    template={templates.push}
                    onChange={(data) => setNotifications({ ...notification, ...data })}
                />
            )}

            {templates.database && (
                <SystemNotificationTemplateEditor
                    type="database"
                    implementation={implementation}
                    organization={organization}
                    fund={fund}
                    notification={currentNotification}
                    implementationNotification={notification}
                    fundState={fundState}
                    template={templates.database}
                    onChange={(data) => setNotifications({ ...notification, ...data })}
                />
            )}
        </div>
    );
}
