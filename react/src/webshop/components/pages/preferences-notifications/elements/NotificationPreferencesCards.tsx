import React, { Dispatch, Fragment, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { useEmailPreferenceService } from '../../../../../dashboard/services/EmailPreferenceService';
import NotificationPreference, { PreferenceOption } from '../../../../../dashboard/props/models/NotificationPreference';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';

export default function NotificationPreferencesCards({
    cardRef,
    setLoaded,
}: {
    cardRef: React.MutableRefObject<HTMLDivElement>;
    setLoaded: Dispatch<SetStateAction<boolean>>;
}) {
    const translate = useTranslate();
    const appConfigs = useAppConfigs();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const emailPreferenceService = useEmailPreferenceService();

    const [editableKeys] = useState([
        'vouchers.payment_success',
        'funds.fund_expires',
        'voucher.assigned',
        'voucher.transaction',
        'digest.daily_requester',
    ]);

    const [preferences, setPreferences] = useState<NotificationPreference>(null);

    const emailPreferences = useMemo(
        () => preferences?.preferences.filter((item) => editableKeys.includes(item.key) && item.type == 'email'),
        [editableKeys, preferences?.preferences],
    );

    const pushPreferences = useMemo(
        () => preferences?.preferences.filter((item) => editableKeys.includes(item.key) && item.type == 'push'),
        [editableKeys, preferences?.preferences],
    );

    const filterOptions = useCallback(
        (preferences: NotificationPreference) => {
            return {
                ...preferences,
                preferences: preferences.preferences.filter((option) => editableKeys.includes(option.key)),
            };
        },
        [editableKeys],
    );

    const fetchPreferences = useCallback(() => {
        setProgress(0);

        emailPreferenceService
            .get()
            .then((res) => setPreferences(filterOptions(res.data.data)))
            .finally(() => {
                setProgress(100);
                setLoaded(true);
            });
    }, [setProgress, emailPreferenceService, filterOptions, setLoaded]);

    const updatePreferences = useCallback(
        (data: NotificationPreference) => {
            emailPreferenceService
                .update(data)
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    setPreferences(filterOptions(res.data.data));
                })
                .catch((err) => pushDanger('Mislukt!', err.data.message));
        },
        [emailPreferenceService, filterOptions, pushDanger, pushSuccess],
    );

    const toggleSubscription = useCallback(
        (email_unsubscribed = true) => updatePreferences({ ...preferences, email_unsubscribed }),
        [updatePreferences, preferences],
    );

    const togglePreference = useCallback(
        (option: PreferenceOption, subscribed: boolean) => {
            preferences.preferences[preferences.preferences.indexOf(option)].subscribed = subscribed;
            updatePreferences({ ...preferences });
        },
        [preferences, updatePreferences],
    );

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    if (!preferences) {
        return null;
    }

    return (
        <Fragment>
            {preferences && !preferences?.email && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{translate('notification_preferences.no_email_title')}</h2>
                    </div>
                    <div className="card-section">
                        <div className="card-heading">{translate('notification_preferences.no_email_description')}</div>
                        <StateNavLink name="identity-emails" className="button button-primary">
                            {translate('notification_preferences.no_email_button')}
                        </StateNavLink>
                    </div>
                </div>
            )}

            {preferences && preferences?.email && preferences?.email_unsubscribed && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{translate('notification_preferences.title_emails_turned_on')}</h2>
                    </div>
                    <div className="card-section">
                        <div className="card-heading">
                            {translate(`notification_preferences.subscribe_desc_${appConfigs?.communication_type}`, {
                                email: preferences.email,
                            })}
                        </div>
                        <div>
                            <button
                                className="button button-primary"
                                type="button"
                                onClick={() => toggleSubscription(false)}
                                id="enable_subscription">
                                {translate('notification_preferences.subscribe')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {preferences && preferences?.email && !preferences?.email_unsubscribed && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{translate('notification_preferences.title_emails_turned_of')}</h2>
                    </div>
                    <div className="card-section">
                        <div className="card-heading">{translate('notification_preferences.unsubscribe_desc')}</div>
                        <div>
                            <button
                                className="button button-primary"
                                type="button"
                                id="disable_subscription"
                                onClick={() => toggleSubscription(true)}>
                                {translate('notification_preferences.unsubscribe')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {preferences && preferences?.email && !preferences?.email_unsubscribed && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{translate('notification_preferences.title_email_preferences')}</h2>
                    </div>

                    <div className="form block block-preferences">
                        {emailPreferences.map((type) => (
                            <label
                                key={type.key}
                                className="preference-option"
                                htmlFor={`option_${type.key}`}
                                role="checkbox"
                                onKeyDown={clickOnKeyEnter}
                                tabIndex={0}
                                aria-checked={type.subscribed}>
                                <div className="preference-option-details">
                                    <div className="card-heading card-heading-padless">
                                        {translate(`notification_preferences.types.${type.key}.title`)}
                                    </div>
                                    <div className="card-text">
                                        {translate(`notification_preferences.types.${type.key}.description`)}
                                    </div>
                                </div>
                                <div className="preference-option-input">
                                    <div className="form-toggle">
                                        <input
                                            type="checkbox"
                                            tabIndex={-1}
                                            id={`option_${type.key}`}
                                            onChange={(e) => {
                                                togglePreference(type, e.target.checked);
                                            }}
                                            checked={type.subscribed}
                                            aria-hidden="true"
                                        />
                                        <div className="form-toggle-inner flex-end">
                                            <div className="toggle-input">
                                                <div className="toggle-input-dot" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="card" ref={cardRef}>
                <div className="card-header">
                    <h2 className="card-title">{translate('notification_preferences.title_push_preferences')}</h2>
                </div>

                <div className="form block block-preferences">
                    {pushPreferences?.map((type) => (
                        <label
                            key={type.key}
                            className="preference-option"
                            htmlFor={`option_${type.key}`}
                            role="checkbox"
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            aria-checked={type.subscribed}>
                            <div className="preference-option-details">
                                <div className="card-heading card-heading-padless">
                                    {translate(`notification_preferences.types.${type.key}.title`)}
                                </div>
                                <div className="card-text">
                                    {translate(`notification_preferences.types.${type.key}.description`)}
                                </div>
                            </div>
                            <div className="preference-option-input">
                                <div className="form-toggle">
                                    <input
                                        type="checkbox"
                                        tabIndex={-1}
                                        id={`option_${type.key}`}
                                        checked={type.subscribed}
                                        onChange={(e) => {
                                            togglePreference(type, e.target.checked);
                                        }}
                                        aria-hidden="true"
                                    />
                                    <div className="form-toggle-inner flex-end">
                                        <div className="toggle-input">
                                            <div className="toggle-input-dot" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </Fragment>
    );
}
