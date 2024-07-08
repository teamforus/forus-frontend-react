import React, { useEffect, useState } from 'react';
import { createContext } from 'react';
import { AppConfigProp, useConfigService } from '../../dashboard/services/ConfigService';
import EnvDataWebshopProp from '../../props/EnvDataWebshopProp';
import useFilter from '../../dashboard/hooks/useFilter';
import FilterScope from '../../dashboard/types/FilterScope';
import { useStateRoutes } from '../modules/state_router/Router';

interface AuthMemoProps {
    title: string;
    setTitle?: React.Dispatch<React.SetStateAction<string>>;
    envData?: EnvDataWebshopProp;
    setEnvData?: React.Dispatch<React.SetStateAction<EnvDataWebshopProp>>;
    appConfigs?: AppConfigProp;
    setAppConfigs?: React.Dispatch<React.SetStateAction<AppConfigProp>>;
    showSearchBox?: boolean;
    setShowSearchBox?: React.Dispatch<React.SetStateAction<boolean>>;
    mobileMenuOpened?: boolean;
    setMobileMenuOpened?: React.Dispatch<React.SetStateAction<boolean>>;
    userMenuOpened?: boolean;
    setUserMenuOpened?: React.Dispatch<React.SetStateAction<boolean>>;
    searchQuery?: string;
    setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
    searchFilter?: FilterScope<{ q: string }>;
    showMobileMenu?: boolean;
    setShowMobileMenu?: React.Dispatch<React.SetStateAction<boolean>>;
    activeMenuDropdown?: string;
    setActiveMenuDropdown?: React.Dispatch<React.SetStateAction<string>>;
}

const mainContext = createContext<AuthMemoProps>(null);
const { Provider } = mainContext;

const MainProvider = ({ children }: { children: React.ReactElement }) => {
    const [envData, setEnvData] = useState<EnvDataWebshopProp>(null);
    const [title, setTitle] = useState(null);
    const [appConfigs, setAppConfigs] = useState(null);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [activeMenuDropdown, setActiveMenuDropdown] = useState(null);
    const { route } = useStateRoutes();

    const configService = useConfigService();

    const searchFilter = useFilter({
        q: '',
    });

    const { update: searchFilterUpdate } = searchFilter;

    useEffect(() => {
        if (!envData?.type) {
            return;
        }

        configService.get(envData.type).then((res) => {
            setAppConfigs(res.data);
        });
    }, [configService, envData?.type]);

    useEffect(() => {
        setTitle(null);
    }, [route.pathname, route.state.name, appConfigs, searchFilterUpdate]);

    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <Provider
            value={{
                title,
                setTitle,
                envData,
                setEnvData,
                appConfigs,
                setAppConfigs,
                showSearchBox,
                setShowSearchBox,
                mobileMenuOpened,
                setMobileMenuOpened,
                userMenuOpened,
                setUserMenuOpened,
                searchFilter,
                showMobileMenu,
                setShowMobileMenu,
                activeMenuDropdown,
                setActiveMenuDropdown,
            }}>
            {children}
        </Provider>
    );
};

export { MainProvider, mainContext };
