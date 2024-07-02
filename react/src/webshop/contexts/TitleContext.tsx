import React, { useEffect, useState } from 'react';
import { createContext } from 'react';
import { useStateRoutes } from '../modules/state_router/Router';
import useTranslate from '../../dashboard/hooks/useTranslate';

interface AuthMemoProps {
    title: string;
    setTitle?: React.Dispatch<React.SetStateAction<string>>;
}

const titleContext = createContext<AuthMemoProps>(null);
const { Provider } = titleContext;

const TitleProvider = ({ children }: { children: React.ReactElement }) => {
    const [title, setTitle] = useState(null);
    const { route } = useStateRoutes();

    const translate = useTranslate();

    useEffect(() => {
        setTitle(
            translate(
                `page_state_loading_titles.${route?.state?.name}`,
                {},
                translate(`page_state_titles.${route?.state?.name}`, {}, 'page_title'),
            ),
        );
    }, [route.pathname, route?.state?.name, translate]);

    useEffect(() => {
        document.title = title;
    }, [title]);

    return <Provider value={{ title, setTitle }}>{children}</Provider>;
};

export { TitleProvider, titleContext };
