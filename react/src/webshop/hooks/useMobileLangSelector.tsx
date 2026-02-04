import React, { Fragment, useMemo, useState } from 'react';
import useMainContext from './useMainContext';
import { clickOnKeyEnter } from '../../dashboard/helpers/wcag';
import useTranslate from '../../dashboard/hooks/useTranslate';
import classNames from 'classnames';

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
            <div className="mobile-menu-languages">
                <div
                    className={classNames(
                        'mobile-menu-languages-header',
                        showOptions && 'mobile-menu-languages-header-active',
                    )}
                    onKeyDown={clickOnKeyEnter}
                    tabIndex={0}
                    onClick={() => setShowOptions(!showOptions)}>
                    <div className="mobile-menu-languages-header-icon">
                        <em className="mdi mdi-web" />
                    </div>
                    <div className="mobile-menu-languages-header-name">
                        <div className="mobile-menu-languages-header-name-prefix">
                            {translate('top_navbar.language.prefix')}
                        </div>
                        {`${languageResource.locale.toUpperCase()} - ${languageResource.name}`}
                    </div>
                    <div className="mobile-menu-languages-header-toggle">
                        <em className={classNames('mdi', showOptions ? 'mdi-chevron-down' : 'mdi-chevron-right')} />
                    </div>
                </div>

                {showOptions && (
                    <Fragment>
                        {languages.map((lang) => (
                            <div
                                className={classNames(
                                    'mobile-menu-item-language',
                                    languageResource.locale === lang.locale && 'mobile-menu-item-language-active',
                                )}
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
                    </Fragment>
                )}
            </div>
        );
    }, [changeLanguage, language, languages, showOptions, translate]);
}
