import React, { useMemo } from 'react';
import Label from '../../../elements/label/Label';
import useImplementationNotificationService from '../../../../services/ImplementationNotificationService';
import SystemNotification from '../../../../props/models/SystemNotification';
import SystemNotificationFundState from '../../../../props/models/SystemNotificationFundState';

export default function SystemNotificationStatusLabel({
    notification,
    fundState = null,
}: {
    notification: SystemNotification;
    fundState?: SystemNotificationFundState;
}) {
    const implementationNotificationsService = useImplementationNotificationService();

    const state = useMemo(() => {
        const notificationStateLabel = {
            inactive: `Inactief`,
            active: 'Actief',
            active_partly: 'Gedeeltelijk',
        };

        if (fundState) {
            const currentNotification = {
                ...notification,
                enable_all: notification.enable_all && fundState.enable_all,
                enable_mail: notification.enable_mail && fundState.enable_mail,
                enable_push: notification.enable_push && fundState.enable_push,
                enable_database: notification.enable_database && fundState.enable_database,
            };

            const hasDisabledChannels =
                implementationNotificationsService.notificationHasDisabledChannels(currentNotification);
            const state = currentNotification.enable_all
                ? hasDisabledChannels
                    ? 'active_partly'
                    : 'active'
                : 'inactive';

            return { state, stateLabel: notificationStateLabel[state] };
        }

        const funds = notification.funds;
        const hasDisabledChannels = implementationNotificationsService.notificationHasDisabledChannels(notification);
        const hasAnyFundDisabled = Boolean(funds?.some((fund) => !fund.enable_all));
        const hasAllFundsDisabled = Boolean(funds?.length && funds.every((fund) => !fund.enable_all));

        const hasAnyFundDisabledChannels = notification.channels.some((type) =>
            Boolean(
                funds?.some((fund) => {
                    const enabled = {
                        database: fund.enable_database,
                        mail: fund.enable_mail,
                        push: fund.enable_push,
                    }[type];

                    return !fund.enable_all || !enabled;
                }),
            ),
        );

        const state =
            !notification.enable_all || hasAllFundsDisabled
                ? 'inactive'
                : hasDisabledChannels || hasAnyFundDisabled || hasAnyFundDisabledChannels
                  ? 'active_partly'
                  : 'active';

        return { state, stateLabel: notificationStateLabel[state] };
    }, [fundState, implementationNotificationsService, notification]);

    if (state?.state === 'active') {
        return <Label type="success">{state.stateLabel}</Label>;
    }

    if (state?.state === 'inactive') {
        return <Label type="danger">{state.stateLabel}</Label>;
    }

    if (state?.state === 'active_partly') {
        return <Label type="warning">{state.stateLabel}</Label>;
    }

    return <Label type="default">{state.stateLabel}</Label>;
}
