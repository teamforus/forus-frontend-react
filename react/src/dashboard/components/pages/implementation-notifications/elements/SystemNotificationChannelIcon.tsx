import React, { useMemo } from 'react';
import classNames from 'classnames';
import useTranslate from '../../../../hooks/useTranslate';
import SystemNotification from '../../../../props/models/SystemNotification';

export default function SystemNotificationChannelIcon({
    notification,
    type,
}: {
    notification: SystemNotification;
    type: 'database' | 'mail' | 'push';
}) {
    const translate = useTranslate();

    const hasAnyFundChannelDisabled = useMemo(() => {
        return Boolean(
            notification.funds?.some((fund) => {
                const enabled = {
                    database: fund.enable_database,
                    mail: fund.enable_mail,
                    push: fund.enable_push,
                }[type];

                return !fund.enable_all || !enabled;
            }),
        );
    }, [notification.funds, type]);

    const hasAllFundsChannelDisabled = useMemo(() => {
        return Boolean(
            notification.funds?.length &&
                notification.funds.every((fund) => {
                    const enabled = {
                        database: fund.enable_database,
                        mail: fund.enable_mail,
                        push: fund.enable_push,
                    }[type];

                    return !fund.enable_all || !enabled;
                }),
        );
    }, [notification.funds, type]);

    const templateChanged = useMemo(() => {
        return notification.templates.filter((item) => item.type == type).length > 0;
    }, [notification.templates, type]);

    const icon = useMemo(() => {
        const iconOff = {
            mail: 'email-off-outline',
            push: 'cellphone-off',
            database: 'bell-off-outline',
        }[type];

        const iconOn = {
            mail: 'email',
            push: 'cellphone',
            database: 'bell',
        }[type];

        if (
            !notification.channels.includes(type) ||
            !notification.enable_all ||
            !notification['enable_' + type] ||
            hasAllFundsChannelDisabled
        ) {
            return iconOff;
        }

        return iconOn;
    }, [hasAllFundsChannelDisabled, notification, type]);

    const color = useMemo(() => {
        if (!notification.channels.includes(type)) {
            return classNames('text-muted-light');
        }

        if (!notification.enable_all || !notification['enable_' + type] || hasAllFundsChannelDisabled) {
            return classNames('text-danger');
        }

        if (hasAnyFundChannelDisabled) {
            return classNames('text-warning');
        }

        return classNames(templateChanged ? 'text-primary-dark' : 'text-success-dark');
    }, [hasAllFundsChannelDisabled, hasAnyFundChannelDisabled, notification, templateChanged, type]);

    const tooltip = useMemo(() => {
        const heading = translate(`system_notifications.types.${type}.title`);

        if (!notification.channels.includes(type)) {
            return { heading, text: translate(`system_notifications.tooltips.channel_not_available`) };
        }

        if (!notification.enable_all || !notification[`enable_${type}`]) {
            return { heading, text: translate(`system_notifications.tooltips.disabled_by_you`) };
        }

        if (hasAllFundsChannelDisabled) {
            return { heading, text: 'Voor alle fondsen uitgeschakeld.' };
        }

        if (hasAnyFundChannelDisabled) {
            return { heading, text: 'Voor een of meer fondsen uitgeschakeld.' };
        }

        return {
            heading,
            text: translate(
                'system_notifications.tooltips.' + (templateChanged ? 'enabled_edited' : 'enabled_default'),
            ),
        };
    }, [hasAllFundsChannelDisabled, hasAnyFundChannelDisabled, notification, templateChanged, translate, type]);

    return (
        <em className={classNames('block', 'block-tooltip-details', 'block-tooltip-hover', `mdi mdi-${icon}`, color)}>
            <div className="tooltip-content tooltip-content-fit tooltip-content-ghost">
                <div className="tooltip-heading text-left nowrap">{tooltip.heading}</div>
                <div className="tooltip-text text-left">{tooltip.text}</div>
            </div>
        </em>
    );
}
