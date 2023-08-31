import React from 'react';
import { useTranslation } from 'react-i18next';
import { PreferenceOption } from '../../../../props/models/NotificationPreference';

export default function NotificationPreferenceCard({
    title,
    preferences,
    togglePreference,
}: {
    title: string;
    preferences: Array<PreferenceOption>;
    togglePreference: (preference: PreferenceOption, subscribed: boolean) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{title}</div>
            </div>
            <div className="form block block-preferences">
                {preferences.map((preference) => (
                    <label key={preference.key} htmlFor={`option_${preference.key}`} className="preference-option">
                        <div className="preference-option-details">
                            <div className="card-heading card-heading-padless">
                                {t(`notification_preferences.types.${preference.key}.title`)}
                            </div>

                            <div className="card-text">
                                {t(`notification_preferences.types.${preference.key}.description`)}
                            </div>
                        </div>
                        <div className="preference-option-input">
                            <div className="form-toggle">
                                <input
                                    type="checkbox"
                                    id={`option_${preference.key}`}
                                    checked={preference.subscribed}
                                    onChange={(e) => togglePreference(preference, e.target.checked)}
                                />
                                <div className="form-toggle-inner flex-end">
                                    <div className="toggle-input">
                                        <div className="toggle-input-dot"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
