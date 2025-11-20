import React from 'react';
import { useHelperService } from '../../../dashboard/services/HelperService';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import useTranslate from '../../../dashboard/hooks/useTranslate';

export default function BlockSkipLinks() {
    const translate = useTranslate();
    const helperService = useHelperService();

    return (
        <div
            className="block block-skip-links"
            role="navigation"
            aria-label={translate('top_navbar.skip_links_aria_label')}>
            <a
                className="sr-only sr-only-focusable"
                href="#"
                onKeyDown={clickOnKeyEnter}
                onClick={(e) => {
                    e.preventDefault();
                    helperService.focusElement(document.querySelector('#main-content'));
                }}>
                {translate('top_navbar.skip_links')} <span>{translate('top_navbar.skip_links_content')}</span>
            </a>
        </div>
    );
}
