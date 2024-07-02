import { useTranslation } from 'react-i18next';
import type { FlatNamespace } from 'i18next';
import type { $Tuple } from 'react-i18next/helpers';
import { useCallback, useContext } from 'react';
import { mainContext } from '../../webshop/contexts/MainContext';

export default function useTranslate<Ns extends FlatNamespace | $Tuple<FlatNamespace>>() {
    const { t } = useTranslation();
    const envData = useContext(mainContext)?.envData;
    const appConfigs = useContext(mainContext)?.appConfigs;

    return useCallback(
        (ns: Ns, options?: object, fallback?: string) => {
            options = {
                implementation: appConfigs?.implementation_name,
                wcagSuffix: envData?.config?.flags?.wcagSuffix && ` - ${envData?.config?.flags?.wcagSuffix}`,
                ...options,
            };

            const value = t(ns as string, options);

            return !value || value === ns ? t(fallback || (ns as string), options) : value;
        },
        [appConfigs?.implementation_name, envData?.config?.flags?.wcagSuffix, t],
    );
}
