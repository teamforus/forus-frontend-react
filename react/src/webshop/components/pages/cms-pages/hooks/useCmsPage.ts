import { useCallback, useEffect, useState } from 'react';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function useCmsPage(pageKey: string) {
    const appConfigs = useAppConfigs();
    const navigateState = useNavigateState();

    const [page, setPage] = useState<ImplementationPage>(null);

    const fetchPage = useCallback(() => {
        const page = appConfigs.pages?.[pageKey] || false;
        const { external = false, external_url = false } = page ? page : {};

        if (!page || (external && !external_url)) {
            return navigateState(WebshopRoutes.HOME);
        } else if (external && external_url) {
            return (document.location = external_url);
        }

        setPage(page);
    }, [appConfigs.pages, navigateState, pageKey]);

    useEffect(() => {
        fetchPage();
    }, [fetchPage]);

    return page;
}
