import React from 'react';
import useEnvData from '../../../hooks/useEnvData';
import AppLinks from '../../elements/app-links/AppLinks';
import useAssetUrl from '../../../hooks/useAssetUrl';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import Section from '../../elements/sections/Section';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function MeApp() {
    const envData = useEnvData();
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('me.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('me.breadcrumbs.me') },
            ]}>
            <Section type={'default'}>
                <div className="block block-about-me_app">
                    <div className="me_app-overview">
                        <div className="block block-markdown">
                            <h2>{translate('me.title')}</h2>
                            <div className="block-description">
                                <p>{translate('me.description')}</p>
                            </div>
                            <br />
                            <h2>{translate('me.download.title')}</h2>
                            <div className="block-description">
                                <TranslateHtml
                                    component={<p />}
                                    i18n={'me.download.description'}
                                    values={{ download_link: envData.config.me_app_link }}
                                />
                            </div>
                            <AppLinks className={'hide-sm'} />
                        </div>
                    </div>
                    <div className="me_app-download flex-center">
                        <AppLinks />
                    </div>
                    <div className="me_app-images">
                        <div className="me_app-image">
                            <img src={assetUrl('/assets/img/me/app-1.jpg')} alt={translate('me.img_alt')} />
                        </div>
                        <div className="me_app-image">
                            <img src={assetUrl('/assets/img/me/app-2.jpg')} alt={translate('me.img_alt')} />
                        </div>
                        <div className="me_app-image">
                            <img src={assetUrl('/assets/img/me/app-3.jpg')} alt={translate('me.img_alt')} />
                        </div>
                    </div>
                </div>
            </Section>
        </BlockShowcase>
    );
}
