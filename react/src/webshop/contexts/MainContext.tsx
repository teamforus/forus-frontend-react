import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createContext } from 'react';
import { AppConfigProp, useConfigService } from '../../dashboard/services/ConfigService';
import EnvDataWebshopProp from '../../props/EnvDataWebshopProp';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import Language from '../../dashboard/props/models/Language';

interface AuthMemoProps {
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
    cookiesAccepted?: boolean;
    language?: string;
    setLanguage?: React.Dispatch<React.SetStateAction<string>>;
    changeLanguage?: (locale: string) => void;
    languages?: Array<Language>;
}

const mainContext = createContext<AuthMemoProps>(null);
const { Provider } = mainContext;

const MainProvider = ({ children, cookiesAccepted }: { children: React.ReactElement; cookiesAccepted?: boolean }) => {
    const configService = useConfigService();

    const navigate = useNavigate();

    const [envData, setEnvData] = useState<EnvDataWebshopProp>(null);
    const [appConfigs, setAppConfigs] = useState<AppConfigProp>(null);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    const languages = useMemo(() => {
        return appConfigs?.languages;
    }, [appConfigs?.languages]);

    const changeLanguage = useCallback(
        (lang: string) => {
            setLanguage(lang);
            localStorage.setItem('locale', lang);
            navigate(0);
        },
        [navigate],
    );

    useEffect(() => {
        if (languages?.length > 0 && !languages.map((item) => item.locale).includes(language)) {
            changeLanguage(languages?.find((item) => item.base).locale);
        }
    }, [changeLanguage, language, languages]);

    useEffect(() => {
        if (!envData?.type) {
            return;
        }

        configService.get(envData.type).then((res) => {
            setAppConfigs(res.data);
        });
    }, [configService, envData?.type]);

    return (
        <Provider
            value={{
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
                cookiesAccepted,
                language,
                setLanguage,
                languages,
                changeLanguage,
            }}>
            {children}
        </Provider>
    );
};

export { MainProvider, mainContext };
