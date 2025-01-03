import React, { useCallback, useMemo, useState } from 'react';
import SelectControl from '../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptionsLang from '../../dashboard/components/elements/select-control/templates/SelectControlOptionsLang';
import { useTranslation } from 'react-i18next';
import useTranslate from '../../dashboard/hooks/useTranslate';
import useEnvData from './useEnvData';

export default function useLangSelector() {
    const { i18n } = useTranslation();
    const translate = useTranslate();
    const envData = useEnvData();
    const [language, setLanguage] = useState(i18n.language || localStorage.getItem('lang'));

    const languages = useMemo(() => {
        return [
            { label: translate('languages.nl'), code: 'nl' },
            { label: translate('languages.en'), code: 'en' },
        ];
    }, [translate]);

    const changeLanguage = useCallback(
        (lang: string) => {
            i18n.changeLanguage(lang)?.then();
            setLanguage(lang);
            localStorage.setItem('lang', lang);
        },
        [i18n],
    );

    return useMemo(() => {
        if (!envData?.config?.language_selector) {
            return null;
        }

        return (
            <SelectControl
                options={languages}
                propKey={'code'}
                propValue={'label'}
                value={language}
                optionsComponent={SelectControlOptionsLang}
                onChange={(language: string) => changeLanguage(language)}
            />
        );
    }, [changeLanguage, language, languages, envData?.config?.language_selector]);
}
