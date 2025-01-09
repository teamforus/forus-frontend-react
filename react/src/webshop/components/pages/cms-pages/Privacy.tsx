import React, { Fragment } from 'react';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useEnvData from '../../../hooks/useEnvData';
import useCmsPage from './hooks/useCmsPage';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';

export default function Privacy() {
    const envData = useEnvData();
    const translate = useTranslate();

    const page = useCmsPage('privacy');

    return (
        <BlockShowcase
            wrapper={true}
            breadcrumbItems={[
                { name: translate('privacy.breadcrumbs.home'), state: 'home' },
                { name: translate('privacy.breadcrumbs.privacy') },
            ]}>
            {page && (
                <div className="section">
                    <div
                        className={`flex flex-vertical ${
                            page.description_position == 'after' ? 'flex-vertical-reverse' : ''
                        }`}>
                        {page && <CmsBlocks page={page} wrapper={false} />}

                        {(!page.description_html || page.description_position !== 'replace') && (
                            <Fragment>
                                <div className="section-title text-left">
                                    {translate(`privacy.${envData.client_key}.title`, null, 'privacy.title')}
                                </div>
                                <div className="block block-accessibility">
                                    <div className="block-accessibility-header">
                                        {translate(`privacy.${envData.client_key}.one`, null, 'privacy.one')}
                                    </div>
                                    <div className="block-text">
                                        <TranslateHtml
                                            component={<div className="title" />}
                                            i18n={`privacy.${envData.client_key}.title_two`}
                                            i18nDefault={`privacy.title_two`}
                                        />
                                        <TranslateHtml
                                            component={<div className="description" />}
                                            i18n={`privacy.${envData.client_key}.two`}
                                            i18nDefault={`privacy.two`}
                                        />
                                    </div>
                                    <div className="block-text">
                                        <TranslateHtml
                                            component={<div className="title" />}
                                            i18n={`privacy.${envData.client_key}.title_three`}
                                            i18nDefault={`privacy.title_three`}
                                        />
                                        <TranslateHtml
                                            component={<div className="description" />}
                                            i18n={`privacy.${envData.client_key}.three`}
                                            i18nDefault={`privacy.three`}
                                        />
                                    </div>
                                    <div className="block-text">
                                        <TranslateHtml
                                            component={<div className="title" />}
                                            i18n={`privacy.${envData.client_key}.title_four`}
                                            i18nDefault={`privacy.title_four`}
                                        />
                                        <TranslateHtml
                                            component={<div className="description" />}
                                            i18n={`privacy.${envData.client_key}.four`}
                                            i18nDefault={`privacy.four`}
                                        />
                                    </div>
                                    <div className="block-text">
                                        <TranslateHtml
                                            component={<div className="title" />}
                                            i18n={`privacy.${envData.client_key}.title_five`}
                                            i18nDefault={`privacy.title_five`}
                                        />
                                        <TranslateHtml
                                            component={<div className="description" />}
                                            i18n={`privacy.${envData.client_key}.five`}
                                            i18nDefault={`privacy.five`}
                                        />
                                    </div>
                                    <div className="block-text">
                                        <TranslateHtml
                                            component={<div className="title" />}
                                            i18n={`privacy.${envData.client_key}.title_six`}
                                            i18nDefault={`privacy.title_six`}
                                        />
                                        <TranslateHtml
                                            component={<div className="description" />}
                                            i18n={`privacy.${envData.client_key}.six`}
                                            i18nDefault={`privacy.six`}
                                        />
                                    </div>
                                    <div className="block-text">
                                        <TranslateHtml
                                            component={<div className="title" />}
                                            i18n={`privacy.${envData.client_key}.title_seven`}
                                            i18nDefault={`privacy.title_seven`}
                                        />
                                        <TranslateHtml
                                            component={<div className="description" />}
                                            i18n={`privacy.${envData.client_key}.seven`}
                                            i18nDefault={`privacy.seven`}
                                        />
                                    </div>

                                    {envData.client_key == 'groningen' && (
                                        <Fragment>
                                            <div className="block-text">
                                                <TranslateHtml
                                                    component={<div className="title" />}
                                                    i18n={`privacy.${envData.client_key}.title_eight`}
                                                />
                                                <TranslateHtml
                                                    component={<div className="description" />}
                                                    i18n={`privacy.${envData.client_key}.eight`}
                                                />
                                            </div>

                                            <div className="block-text">
                                                <TranslateHtml
                                                    component={<div className="title" />}
                                                    i18n={`privacy.${envData.client_key}.title_nine`}
                                                />
                                                <TranslateHtml
                                                    component={<div className="description" />}
                                                    i18n={`privacy.${envData.client_key}.nine`}
                                                />
                                            </div>
                                        </Fragment>
                                    )}
                                </div>
                            </Fragment>
                        )}
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
