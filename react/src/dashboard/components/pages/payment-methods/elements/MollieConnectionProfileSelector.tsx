import React from 'react';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import MollieConnectionProfile from '../../../../props/models/MollieConnectionProfile';
import useTranslate from '../../../../hooks/useTranslate';

export default function MollieConnectionProfileSelector({
    profiles,
    currentProfile,
    currentProfileId,
    onSelect,
    onChange,
}: {
    profiles: Array<MollieConnectionProfile>;
    currentProfile?: MollieConnectionProfile;
    currentProfileId?: number;
    onSelect: (value: number) => void;
    onChange: () => void;
}) {
    const translate = useTranslate();

    return (
        <div className="flex flex-horizontal">
            <div className="form">
                <div className="form-group">
                    <SelectControl
                        className="form-control inline-filter-control"
                        propKey={'id'}
                        placeholder={translate('mollie_connection.labels.current_profile')}
                        options={profiles}
                        value={currentProfileId}
                        onChange={(currentProfileId: number) => onSelect(currentProfileId)}
                        optionsComponent={SelectControlOptions}
                    />
                </div>
            </div>

            <button
                className="button button-primary"
                disabled={!currentProfileId || (currentProfile && currentProfileId == currentProfile.id)}
                type="button"
                onClick={() => onChange()}>
                {translate('mollie_connection.buttons.change_profile')}
            </button>
        </div>
    );
}
