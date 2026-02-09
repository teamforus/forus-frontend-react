import React, { useMemo } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import useCmsPage from './hooks/useCmsPage';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useAppConfigs from '../../../hooks/useAppConfigs';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import classNames from 'classnames';

export default function ProvidersSignUp() {
    const page = useCmsPage('provider');
    const envData = useEnvData();
    const translate = useTranslate();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();

    const providerPanelUrl = useMemo(() => {
        return appConfigs?.fronts.url_provider || '';
    }, [appConfigs?.fronts.url_provider]);

    const signUpUrlParams = useMemo(() => {
        const params = envData.config?.provider_sign_up_filters || {};
        const paramKeys = Object.keys(params);

        return [
            paramKeys.length > 0 ? '?' : '',
            paramKeys.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&'),
        ].join('');
    }, [envData.config?.provider_sign_up_filters]);

    if (!page) {
        return null;
    }

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('provider_sign_up.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('provider_sign_up.breadcrumbs.sign_up_provider') },
            ]}>
            {page && (
                <div
                    className={classNames(
                        'flex',
                        'flex-vertical',
                        page.description_position == 'after' && 'flex-vertical-reverse',
                    )}>
                    {page && <CmsBlocks page={page} largeMarkdown={true} />}

                    {(!page.description_html || page.description_position !== 'replace') && (
                        <div className="wrapper">
                            <div className="block block-sign_up-provider">
                                <div className="sign_up-overview">
                                    <h1 className="sr-only">{translate('provider_sign_up.heading_screen_reader')}</h1>
                                    <div className="block block-markdown">
                                        <h1>{translate('provider_sign_up.heading')}</h1>
                                        <p>{translate('provider_sign_up.description.fill_form')}</p>
                                        <p>{translate('provider_sign_up.description.read_instruction')}</p>
                                        <p>
                                            <a
                                                className="button button-primary-outline"
                                                href={providerPanelUrl + 'sign-up' + signUpUrlParams}
                                                target="_self">
                                                {translate('provider_sign_up.button.register')}
                                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                            </a>
                                        </p>
                                        <p>
                                            {translate('provider_sign_up.description.already_account')}{' '}
                                            <a href={providerPanelUrl} target="_self">
                                                {translate('provider_sign_up.button.login')}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <div className="sign_up-images">
                                    <div className="sign_up-image">
                                        <img src={assetUrl('/assets/img/provider-sign_up-preview.svg')} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </BlockShowcase>
    );
}
