import React from 'react';
import { PreferenceOption } from '../../../../props/models/NotificationPreference';
import useTranslate from '../../../../hooks/useTranslate';
import ToggleControl from '../../../elements/forms/controls/ToggleControl';

export default function NotificationPreferenceCard({
    title,
    preferences,
    togglePreference,
}: {
    title: string;
    preferences: Array<PreferenceOption>;
    togglePreference: (preference: PreferenceOption, subscribed: boolean) => void;
}) {
    const translate = useTranslate();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{title}</div>
            </div>
            <div className="form block block-preferences">
                {preferences.map((preference) => (
                    <div
                        key={preference.key}
                        className="preference-option"
                        role="button"
                        tabIndex={0}
                        onClick={() => togglePreference(preference, !preference.subscribed)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                togglePreference(preference, !preference.subscribed);
                            }
                        }}>
                        <div className="preference-option-details">
                            <div className="card-heading card-heading-padless">
                                {translate(`notification_preferences.types.${preference.key}.title`)}
                            </div>

                            <div className="card-text">
                                {translate(`notification_preferences.types.${preference.key}.description`)}
                            </div>
                        </div>
                        <div className="preference-option-input">
                            <ToggleControl
                                id={`option_${preference.type}_${preference.key}`}
                                checked={preference.subscribed}
                                onChange={(_, checked) => togglePreference(preference, checked)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
