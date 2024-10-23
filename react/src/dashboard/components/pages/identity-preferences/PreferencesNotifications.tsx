import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { useEmailPreferenceService } from '../../../services/EmailPreferenceService';
import NotificationPreference, { PreferenceOption } from '../../../props/models/NotificationPreference';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import NotificationPreferenceCard from './elements/NotificationPreferenceCard';
import useEnvData from '../../../hooks/useEnvData';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import useTranslate from '../../../hooks/useTranslate';

export default function PreferencesNotifications() {
    const envData = useEnvData();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const emailPreferenceService = useEmailPreferenceService();

    const [preferences, setPreferences] = useState<NotificationPreference>(null);

    const [sponsorKeys] = useState([
        'funds.provider_applied',
        'funds.balance_warning',
        'funds.product_added',
        'employee.created',
        'employee.deleted',
        'digest.daily_sponsor',
        'digest.daily_validator',
    ]);

    const [providerKeys] = useState([
        'funds.new_fund_started',
        'funds.new_fund_applicable',
        'funds.provider_approved',
        'funds.provider_rejected',
        'funds.product_reserved',
        'funds.product_sold_out',
        'bunq.transaction_success',
        'employee.created',
        'employee.deleted',
        'digest.daily_provider_funds',
        'digest.daily_provider_products',
    ]);

    const [validatorKeys] = useState([
        'validations.new_validation_request',
        'validations.you_added_as_validator',
        'employee.created',
        'employee.deleted',
        'digest.daily_validator',
        'funds_requests.assigned_by_supervisor',
    ]);

    const [editableKeys] = useState(
        { sponsor: sponsorKeys, provider: providerKeys, validator: validatorKeys }[envData.client_type] || [],
    );

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
            .finally(() => setProgress(100));
    }, [emailPreferenceService, setProgress, filterOptions]);

    const updatePreferences = useCallback(
        (data) => {
            emailPreferenceService.update(data).then(
                (res) => {
                    pushSuccess('Opgeslagen!');
                    setPreferences(filterOptions(res.data.data));
                },
                (res) => pushDanger('Mislukt!', res.data.message),
            );
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
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {/*<FormError error={errorMessage} />*/}

            {preferences.email_unsubscribed && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{translate('notification_preferences.title_preferences')}</div>
                    </div>

                    <div className="card-section">
                        <div className="card-heading">
                            {translate('notification_preferences.subscribe_desc', { email: preferences.email })}
                        </div>
                        <div>
                            <button
                                type="button"
                                className="button button-primary"
                                onClick={() => toggleSubscription(false)}>
                                {translate('notification_preferences.subscribe')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!preferences.email && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{translate('notification_preferences.title_preferences')}</div>
                    </div>

                    <div className="card-section">
                        <div className="card-heading">
                            Er is nog geen e-mailadres toegevoegd
                            <br />
                            |Voeg een e-mailadres toe om berichten te ontvangen
                        </div>
                        <NavLink to={getStateRouteUrl('preferences-emails')} className="button button-primary">
                            E-mailadres toevoegen
                        </NavLink>
                    </div>
                </div>
            )}

            {preferences.email && !preferences.email_unsubscribed && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{translate('notification_preferences.title_preferences')}</div>
                    </div>

                    <div className="card-section">
                        <div className="card-heading">{translate('notification_preferences.unsubscribe_desc')}</div>
                        <div>
                            <button
                                type="button"
                                className="button button-primary"
                                onClick={() => toggleSubscription(true)}>
                                {translate('notification_preferences.unsubscribe')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {preferences.email && !preferences.email_unsubscribed && (
                <NotificationPreferenceCard
                    title={translate('notification_preferences.title_email_preferences')}
                    preferences={emailPreferences}
                    togglePreference={togglePreference}
                />
            )}

            <NotificationPreferenceCard
                title={translate('notification_preferences.title_push_preferences')}
                preferences={pushPreferences}
                togglePreference={togglePreference}
            />
        </Fragment>
    );
}
