import React from 'react';
import { useHelperService } from '../../../dashboard/services/HelperService';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function SkipLinks() {
    const helperService = useHelperService();

    return (
        <div className="skiplinks" role="navigation">
            <a
                className="sr-only sr-only-focusable"
                href="#"
                onKeyDown={clickOnKeyEnter}
                onClick={(e) => {
                    e.preventDefault();
                    helperService.focusElement(document.querySelector('#main-content'));
                }}>
                Ga direct naar: <span>Hoofdinhoud</span>
            </a>
        </div>
    );
}
