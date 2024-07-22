import React, { useCallback, useMemo, useState } from 'react';
import ToggleControl from '../../../elements/forms/controls/ToggleControl';
import useImplementationNotificationService from '../../../../services/ImplementationNotificationService';
import { keyBy } from 'lodash';
import Implementation from '../../../../props/models/Implementation';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import SystemNotification from '../../../../props/models/SystemNotification';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import SystemNotificationTemplateEditor from './SystemNotificationTemplateEditor';
import Fund from '../../../../props/models/Fund';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function SystemNotificationEditor({
    fund,
    funds,
    setFund,
    notification,
    organization,
    implementation,
    setNotifications,
}: {
    fund: Partial<Fund>;
    funds?: Array<Partial<Fund>>;
    setFund?: React.Dispatch<React.SetStateAction<Partial<Fund>>>;
    notification: SystemNotification;
    organization: Organization;
    implementation: Implementation;
    setNotifications: React.Dispatch<React.SetStateAction<SystemNotification>>;
}) {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const implementationNotificationsService = useImplementationNotificationService();

    const [notificationToggleLabels] = useState({
        disabled: `Uitgezet, alle kanalen zijn uitgezet.`,
        enabled_all: 'Aangezet, alle kanalen zijn aangezet.',
        enabled_partial: 'Aangezet, sommige kanalen staan afzonderlijk uit.',
    });

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

    const state = useMemo(() => {
        return implementationNotificationsService.notificationToStateLabel(notification);
    }, [implementationNotificationsService, notification]);

    const toggleSwitched = useCallback(() => {
        setProgress(0);

        const data = { enable_all: !notification.enable_all };
        const hasDisabledChannels = implementationNotificationsService.notificationHasDisabledChannels(notification);

        const message = data.enable_all
            ? hasDisabledChannels
                ? notificationToggleLabels.enabled_partial
                : notificationToggleLabels.enabled_all
            : notificationToggleLabels.disabled;

        implementationNotificationsService
            .update(organization.id, implementation.id, notification.id, data)
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
                <div className={`card-header ${notification.enable_all ? '' : 'card-header-danger'}`}>
                    <div className="flex flex-row">
                        <div className="flex flex-pad flex-grow">
                            <div className={`card-title ${notification.enable_all ? '' : 'text-muted-dark'}`}>
                                <em className="mdi mdi-web" />
                                <span>{notification.title}</span>
                                <span>{translate(`system_notifications.notifications.${notification.key}.title`)}</span>
                            </div>
                        </div>

                        {notification.editable && (
                            <div className="flex flex-pad flex-vertical flex-center">
                                <ToggleControl
                                    id={'enable_all'}
                                    className="form-toggle-danger"
                                    checked={notification.enable_all}
                                    title={notification.enable_all ? '' : notificationToggleLabels.disabled}
                                    onChange={toggleSwitched}
                                    labelRight={false}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {funds && funds.length > 0 && (
                    <div className={`card-section ${notification.enable_all ? '' : 'card-section-danger'}`}>
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
                                            optionsComponent={SelectControlOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`card-section ${notification.enable_all ? '' : 'card-section-danger'}`}>
                    <div className="card-block card-block-keyvalue">
                        <div className="keyvalue-item">
                            <div className="keyvalue-key text-right">
                                <div className="text-strong">Status</div>
                            </div>
                            <div className="keyvalue-value">
                                <div
                                    className={`transition-background label label-round ${
                                        {
                                            active: 'label-success',
                                            inactive: 'label-danger',
                                            active_partly: 'label-warning',
                                        }[state.state]
                                    }`}>
                                    {state.stateLabel}
                                </div>
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
                                    {notification?.last_sent_date_locale || <TableEmptyValue />}
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
                    notification={notification}
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
                    notification={notification}
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
                    notification={notification}
                    template={templates.database}
                    onChange={(data) => setNotifications({ ...notification, ...data })}
                />
            )}
        </div>
    );
}
