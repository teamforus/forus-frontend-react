import { useCallback, useMemo } from 'react';
import useEnvData from '../../../../hooks/useEnvData';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { MenuItem } from '../../../../../props/EnvDataWebshopProp';

export default function useTopMenuItems(onlyEnabled = true) {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const identity = useAuthIdentity();
    const translate = useTranslate();

    const replaceMenuItems = useCallback(
        (defaultMenuItems: Array<MenuItem>, customMenuItems: Array<MenuItem>): Array<MenuItem> => {
            return customMenuItems
                .map((menuItem: MenuItem) => {
                    const defaultItem = defaultMenuItems.find((item: MenuItem) => item.id == menuItem.id);
                    const item = { ...defaultItem, ...{ ...menuItem, enabled: true } };

                    return { ...item };
                })
                .filter((menuItem: MenuItem) => menuItem.enabled);
        },
        [],
    );

    const defaultMenuItems = useMemo<Array<MenuItem>>(() => {
        if (!envData || !appConfigs) {
            return [];
        }

        return [
            {
                id: 'home_page',
                nameTranslate: `top_navbar.items.home`,
                state: 'home',
                stateParams: {},
                target: '_self',
                enabled: true,
            },
            {
                id: 'funds_page',
                nameTranslate: `top_navbar.items.${envData.client_key}.funds`,
                nameTranslateDefault: translate(`top_navbar.items.funds`),
                state: 'funds',
                stateParams: {},
                target: '_self',
                enabled: !!(
                    envData.config.flags.fundsMenu &&
                    (identity || envData.config?.flags?.fundsMenuIfLoggedOut)
                ),
            },
            {
                id: 'products_page',
                nameTranslate: `top_navbar.items.${envData.client_key}.products`,
                nameTranslateDefault: translate(`top_navbar.items.products`),
                state: 'products',
                stateParams: {},
                target: '_self',
                enabled: !!(
                    appConfigs?.has_internal_funds &&
                    appConfigs?.products?.list &&
                    (envData.config.flags.productsMenu || !!identity)
                ),
            },
            {
                id: 'providers_page',
                nameTranslate: `top_navbar.items.providers`,
                state: 'providers',
                stateParams: {},
                target: '_self',
                enabled: !!envData.config.flags.providersMenu,
            },
            {
                id: 'explanation_page',
                target: appConfigs.pages?.explanation?.external ? '_blank' : '_self',
                nameTranslate: `top_navbar.items.${envData.client_key}.explanation`,
                nameTranslateDefault: translate(`top_navbar.items.explanation`),
                state: 'explanation',
                stateParams: {},
                enabled: true,
            },
            {
                id: 'providers_sign_up_page',
                nameTranslate: `top_navbar.items.signup`,
                state: 'sign-up',
                stateParams: {},
                target: '_self',
                enabled: !!envData.config.flags.providersSignUpMenu,
            },
        ].filter((menuItem) => menuItem.enabled);
    }, [appConfigs, envData, identity, translate]);

    return useMemo(() => {
        if (!envData || !appConfigs) {
            return [];
        }

        return [
            ...(envData.config?.flags.menuItems
                ? replaceMenuItems(defaultMenuItems, envData.config?.flags.menuItems)
                : defaultMenuItems),
        ]
            .map((item: MenuItem) => ({
                ...item,
                nameTranslate: item?.name || item?.nameTranslate,
                nameTranslateDefault: item?.name || item?.nameTranslateDefault,
                target: item.target || '_self',
                stateValue: item.state
                    ? `${item.state}(${item.stateParams ? JSON.stringify(item.stateParams) : ''})`
                    : null,
            }))
            .filter((item) => !onlyEnabled || item.enabled);
    }, [appConfigs, defaultMenuItems, envData, onlyEnabled, replaceMenuItems]);
}
