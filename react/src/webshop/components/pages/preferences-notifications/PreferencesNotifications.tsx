import React, { useEffect, useMemo, useRef, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import NotificationPreferencesCards from './elements/NotificationPreferencesCards';
import PushNotificationPreferencesCard from './elements/PushNotificationPreferencesCard';
import { useParams } from 'react-router-dom';

export default function PreferencesNotifications() {
    const { section = null } = useParams();
    const translate = useTranslate();

    const notificationsCardRef = useRef(null);
    const pushNotificationsCardRef = useRef(null);

    const [loadedNotification, setLoadedNotification] = useState<boolean>(false);
    const [loadedPushNotification, setLoadedPushNotification] = useState<boolean>(false);

    const componentsLoaded = useMemo(() => {
        return loadedNotification && loadedPushNotification;
    }, [loadedNotification, loadedPushNotification]);

    useEffect(() => {
        if (!componentsLoaded) {
            return;
        }

        if (notificationsCardRef.current && section === 'notifications') {
            notificationsCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (pushNotificationsCardRef.current && section === 'push') {
            pushNotificationsCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [componentsLoaded, section]);

    return (
        <BlockShowcaseProfile
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink className="breadcrumb-item" name="home">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active">
                        {translate('notification_preferences.title_preferences')}
                    </div>
                </div>
            }
            profileHeader={
                <div className="profile-content-header clearfix">
                    <div className="profile-content-title">
                        <div className="pull-left">
                            <h1 className="profile-content-header">Notificatievoorkeuren</h1>
                        </div>
                    </div>
                </div>
            }>
            <NotificationPreferencesCards cardRef={notificationsCardRef} setLoaded={setLoadedNotification} />

            <div className="profile-content-header">
                <div className="profile-content-title">
                    <h1 className="profile-content-header">Pop-up meldingen</h1>
                </div>
            </div>

            <PushNotificationPreferencesCard cardRef={pushNotificationsCardRef} setLoaded={setLoadedPushNotification} />
        </BlockShowcaseProfile>
    );
}
