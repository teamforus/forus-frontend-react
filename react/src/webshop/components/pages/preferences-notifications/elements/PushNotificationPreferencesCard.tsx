import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import SelectControl from '../../../../../dashboard/components/elements/select-control/SelectControl';
import { pushNotificationContext } from '../../../../../dashboard/modules/push_notifications/context/PushNotificationsContext';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';

export default function PushNotificationPreferencesCard({
    cardRef,
    setLoaded,
}: {
    cardRef: React.MutableRefObject<HTMLDivElement>;
    setLoaded: Dispatch<SetStateAction<boolean>>;
}) {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();

    const { getDismissTimeValue, setDismissTimeValue } = useContext(pushNotificationContext);

    const [notificationsDismissTime, setNotificationsDismissTime] = useState<{ [key: string]: number }>(null);
    const [defaultTime] = useState(15);

    const [dismissTimeOptions] = useState([
        { key: 5, name: '5 seconden' },
        { key: 10, name: '10 seconden' },
        { key: 15, name: '15 seconden' },
        { key: 30, name: '30 seconden' },
        { key: 60, name: '60 seconden' },
    ]);

    const validDismissTime = useCallback(
        (time: number) => {
            return time == 0 || dismissTimeOptions.find((option) => option.key == time);
        },
        [dismissTimeOptions],
    );

    const setDismissTime = useCallback(
        (type: string, time: number) => {
            if (validDismissTime(time)) {
                setDismissTimeValue(type, time);
            }
        },
        [setDismissTimeValue, validDismissTime],
    );

    const selectDismissTime = useCallback(
        (type: string, value: number) => {
            setDismissTime(type, value);

            setNotificationsDismissTime({
                ...notificationsDismissTime,
                [type]: value,
            });

            pushSuccess(
                'Nieuwe tijd is ingeschakeld',
                `Pop-up meldingen worden automatisch na ${value} seconden gesloten.`,
            );
        },
        [notificationsDismissTime, pushSuccess, setDismissTime],
    );

    const togglePreference = useCallback(
        (type: string, value: boolean) => {
            if (!value) {
                setDismissTime(type, 0);
                pushSuccess(
                    'Automatisch sluiten is uitgeschakeld',
                    'Het automatisch sluiten van pop-up meldingen is uitgeschakeld.',
                );
            } else {
                setDismissTime(type, defaultTime);
                pushSuccess(
                    'Automatisch sluiten is ingeschakeld',
                    'Het automatisch sluiten van pop-up meldingen is ingeschakeld.',
                );
            }

            setNotificationsDismissTime({
                ...notificationsDismissTime,
                [type]: value ? defaultTime : 0,
            });
        },
        [defaultTime, notificationsDismissTime, pushSuccess, setDismissTime],
    );

    useEffect(() => {
        if (!notificationsDismissTime) {
            setNotificationsDismissTime({
                webshop: getDismissTimeValue('webshop'),
                bookmarks: getDismissTimeValue('bookmarks'),
            });

            setLoaded(true);
        }
    }, [getDismissTimeValue, notificationsDismissTime, setLoaded]);

    if (!notificationsDismissTime) {
        return null;
    }

    return (
        <div className="card" ref={cardRef}>
            <div className="card-header">
                <h2 className="card-title">
                    {translate('notification_preferences.push_notifications_preferences.title')}
                </h2>
            </div>

            <div className="form form-compact block block-preferences">
                <label
                    className="preference-option"
                    htmlFor={`webshop_push_notifications_dismiss`}
                    role="checkbox"
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-checked={!!notificationsDismissTime.webshop}>
                    <div className="preference-option-details">
                        <div className="card-heading card-heading-padless">
                            {translate(`notification_preferences.push_notifications_dismiss_time.webshop.title`)}
                        </div>
                        <div className="card-text">
                            {translate(`notification_preferences.push_notifications_dismiss_time.webshop.description`)}
                        </div>
                    </div>
                    <div className="preference-option-input">
                        <div className="form-toggle">
                            <input
                                type="checkbox"
                                tabIndex={-1}
                                id={`webshop_push_notifications_dismiss`}
                                onChange={(e) => togglePreference('webshop', e.target.checked)}
                                checked={!!notificationsDismissTime.webshop}
                            />
                            <div className="form-toggle-inner flex-end">
                                <div className="toggle-input">
                                    <div className="toggle-input-dot" />
                                </div>
                            </div>
                        </div>
                    </div>
                </label>

                {notificationsDismissTime.webshop > 0 && (
                    <div className="card-section card-section-primary card-section-md">
                        <div className="form-group">
                            <SelectControl
                                propKey="key"
                                allowSearch={false}
                                value={notificationsDismissTime.webshop}
                                onChange={(time?: number) => selectDismissTime('webshop', time)}
                                options={dismissTimeOptions}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="form form-compact block block-preferences">
                <label
                    className="preference-option"
                    htmlFor={`bookmarks_push_notifications_dismiss`}
                    role="checkbox"
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    aria-checked={!!notificationsDismissTime.bookmarks}>
                    <div className="preference-option-details">
                        <div className="card-heading card-heading-padless">
                            {translate(`notification_preferences.push_notifications_dismiss_time.bookmarks.title`)}
                        </div>
                        <div className="card-text">
                            {translate(
                                `notification_preferences.push_notifications_dismiss_time.bookmarks.description`,
                            )}
                        </div>
                    </div>
                    <div className="preference-option-input">
                        <div className="form-toggle">
                            <input
                                type="checkbox"
                                tabIndex={-1}
                                id={`bookmarks_push_notifications_dismiss`}
                                onChange={(e) => togglePreference('bookmarks', e.target.checked)}
                                checked={!!notificationsDismissTime.bookmarks}
                            />
                            <div className="form-toggle-inner flex-end">
                                <div className="toggle-input">
                                    <div className="toggle-input-dot" />
                                </div>
                            </div>
                        </div>
                    </div>
                </label>

                {notificationsDismissTime.bookmarks > 0 && (
                    <div className="card-section card-section-primary card-section-md">
                        <div className="form-group">
                            <SelectControl
                                propKey="key"
                                allowSearch={false}
                                value={notificationsDismissTime.bookmarks}
                                onChange={(time?: number) => selectDismissTime('bookmarks', time)}
                                options={dismissTimeOptions}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="card-footer card-footer-warning card-footer-sm">
                Schakel het automatisch sluiten van meldingen in om de weergavetijd van meldingen aan te passen.
            </div>
        </div>
    );
}
