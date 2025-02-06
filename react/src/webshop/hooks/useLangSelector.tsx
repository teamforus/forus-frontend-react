import React, { useMemo } from 'react';
import SelectControl from '../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptionsLang from '../../dashboard/components/elements/select-control/templates/SelectControlOptionsLang';
import useMainContext from './useMainContext';

export default function useLangSelector() {
    const { language, languages, changeLanguage } = useMainContext();

    return useMemo(() => {
        if (languages?.length <= 1) {
            return null;
        }

        return (
            <SelectControl
                options={languages}
                propKey={'locale'}
                propValue={'name'}
                value={language}
                optionsComponent={SelectControlOptionsLang}
                onChange={(language: string) => changeLanguage(language)}
            />
        );
    }, [changeLanguage, language, languages]);
}
