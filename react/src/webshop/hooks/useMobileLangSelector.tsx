import React, { Fragment, useMemo, useState } from 'react';
import useMainContext from './useMainContext';
import { clickOnKeyEnter } from '../../dashboard/helpers/wcag';
import useTranslate from '../../dashboard/hooks/useTranslate';

export default function useMobileLangSelector() {
    const { language, languages, changeLanguage } = useMainContext();
    const translate = useTranslate();
    const [showOptions, setShowOptions] = useState(false);

    return useMemo(() => {
        if (languages?.length <= 1) {
            return null;
        }

        const languageResource = languages?.filter((lang) => lang.locale === language)?.[0];

        return (
            <Fragment>
                <div
                    className="mobile-menu-group-header mobile-menu-language-group-header"
                    onKeyDown={clickOnKeyEnter}
                    tabIndex={0}
                    onClick={() => setShowOptions(!showOptions)}>
                    <em className="mdi mdi-web" />
                    <div className="mobile-menu-language-group-header-prefix">
                        {translate('top_navbar.language.prefix')}
                    </div>
                    <div className="mobile-menu-language-group-header-name">
                        {languageResource.locale.toUpperCase()} - {languageResource.name}
                    </div>
                    <span className="mobile-menu-language-group-header-icon">
                        <em className={showOptions ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'} />
                    </span>
                </div>

                {showOptions && (
                    <div className="mobile-menu-items">
                        {languages.map((lang) => (
                            <div
                                className="mobile-menu-item mobile-menu-item-language"
                                key={lang.locale}
                                onKeyDown={clickOnKeyEnter}
                                tabIndex={0}
                                onClick={() => changeLanguage(lang.locale)}>
                                {lang.locale.toUpperCase()}
                                <div className="mobile-menu-item-language-separator" />
                                <div className="mobile-menu-item-language-name">{lang.name}</div>
                                {languageResource.locale === lang.locale && (
                                    <div className="mobile-menu-item-language-check mdi mdi-check" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Fragment>
        );
    }, [changeLanguage, language, languages, showOptions, translate]);
}
