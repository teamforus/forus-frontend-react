import React, { ReactNode, useState } from 'react';
import ToggleControl from '../../../dashboard/components/elements/forms/controls/ToggleControl';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function CookieBannerToggle({
    accepted,
    setAccepted,
    disabled,
    title,
    description,
}: {
    accepted: boolean;
    setAccepted: React.Dispatch<React.SetStateAction<boolean>>;
    disabled: boolean;
    title: string;
    description: ReactNode;
}) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="cookie-configs-toggle">
            <div className="cookie-configs-toggle-title">
                {title}
                <div>
                    <ToggleControl
                        tabIndex={disabled ? null : 1}
                        disabled={disabled}
                        checked={accepted}
                        onKeyDown={clickOnKeyEnter}
                        onChange={() => (disabled ? null : setAccepted(!accepted))}
                    />
                </div>
            </div>

            {showDetails && <div className="cookie-configs-toggle-details">{description}</div>}

            <div
                className="cookie-configs-toggle-more"
                onKeyDown={clickOnKeyEnter}
                tabIndex={1}
                onClick={() => setShowDetails(!showDetails)}>
                {!showDetails ? 'Bekijk meer' : 'Bekijk minder'}
                <em className={classNames('mdi ', !showDetails ? 'mdi-chevron-down' : 'mdi-chevron-up')} />
            </div>
        </div>
    );
}
