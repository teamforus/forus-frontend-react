import { FallbackNs, useTranslation } from 'react-i18next';
import type { FlatNamespace, KeyPrefix } from 'i18next';
import type { $Tuple } from 'react-i18next/helpers';
import { useCallback, useContext } from 'react';
import { mainContext } from '../../webshop/contexts/MainContext';

export default function useTranslate<
    Ns extends FlatNamespace | $Tuple<FlatNamespace>,
    KPref extends KeyPrefix<FallbackNs<Ns>>,
>() {
    const { t } = useTranslation();
    const appConfigs = useContext(mainContext)?.appConfigs;

    return useCallback(
        (ns: Ns, options?: object, fallback?: string) => {
            options = {
                implementation: appConfigs?.implementation_name,
                pageTitleSuffix: appConfigs?.page_title_suffix && ` - ${appConfigs?.page_title_suffix}`,
                ...(options as unknown as object),
            } as never;

            const value = t(ns as string, options as unknown as KPref);

            return !value || value === ns ? t(fallback || (ns as string), options as unknown as KPref) : value;
        },
        [appConfigs?.implementation_name, appConfigs?.page_title_suffix, t],
    );
}
