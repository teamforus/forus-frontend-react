import usePushDanger from './usePushDanger';
import { useCallback } from 'react';
import { ResponseError } from '../props/ApiResponses';
import { useNavigateState } from '../modules/state_router/Router';
import useActiveOrganization from './useActiveOrganization';
import useTranslate from './useTranslate';

export default function usePushApiError(redirectStateName?: string) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const navigateSate = useNavigateState();
    const activeOrganization = useActiveOrganization();

    return useCallback(
        (err: ResponseError, defaultMessage?: string) => {
            const titleCodes = {
                0: 'server_error',
                403: 'forbidden',
                404: 'not_found',
                422: 'validation_error',
                500: 'server_error',
            };

            const title = translate(`errors.api.title.${titleCodes[err.status] || 'default'}`);
            const message = err?.data?.message || defaultMessage || translate('errors.api.description');

            pushDanger(title, message);

            if (redirectStateName) {
                return navigateSate(redirectStateName, { organizationId: activeOrganization?.id });
            }
        },
        [activeOrganization?.id, navigateSate, pushDanger, redirectStateName, translate],
    );
}
