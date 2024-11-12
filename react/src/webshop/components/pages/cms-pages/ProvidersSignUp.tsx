import React, { useMemo } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import useCmsPage from './hooks/useCmsPage';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useAppConfigs from '../../../hooks/useAppConfigs';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';

export default function ProvidersSignUp() {
    const page = useCmsPage('provider');
    const envData = useEnvData();
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
            wrapper={true}
            breadcrumbItems={[{ name: 'Home', state: 'home' }, { name: 'Aanmelden als aanbieder' }]}>
            {page && (
                <div
                    className={`flex flex-vertical ${
                        page.description_position == 'after' ? 'flex-vertical-reverse' : ''
                    }`}>
                    {page && <CmsBlocks page={page} wrapper={false} />}

                    {(!page.description_html || page.description_position !== 'replace') && (
                        <div className="block block-sign_up-provider">
                            <div className="sign_up-overview">
                                <div className="block block-markdown">
                                    <h1 className="sr-only">Aanmelden</h1>
                                    <h1>Aanmelden als aanbieder</h1>
                                    <p>
                                        Door het online formulier in te vullen meldt u uw organisatie aan als aanbieder.
                                        Het invullen duurt ongeveer 15 minuten.
                                    </p>
                                    <p>Lees de instructie in elke stap goed door.</p>
                                    <p>
                                        <a
                                            className="button button-primary-outline"
                                            href={providerPanelUrl + 'sign-up' + signUpUrlParams}
                                            target="_self">
                                            Aanmelden
                                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                        </a>
                                    </p>
                                    <p>
                                        Heeft u al een account?{' '}
                                        <a href={providerPanelUrl} target="_self">
                                            Log dan in
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
                    )}
                </div>
            )}
        </BlockShowcase>
    );
}
