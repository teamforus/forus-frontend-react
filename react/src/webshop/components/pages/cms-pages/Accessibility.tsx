import React, { useMemo } from 'react';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useEnvData from '../../../hooks/useEnvData';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';

export default function Accessibility() {
    const envData = useEnvData();
    const page = useCmsPage('accessibility');

    const translate = useTranslate();

    const vars = useMemo(() => {
        return {
            implementation_name: translate(`accessibility.vars.${envData.client_key}.implementation_name`),
            organization_name: translate(`accessibility.vars.${envData.client_key}.organization_name`),
            website: translate(`accessibility.vars.${envData.client_key}.website`),
            contact_email: translate(`accessibility.vars.${envData.client_key}.contact_email`),
            accessibility_link: translate(`accessibility.vars.${envData.client_key}.accessibility_link`),
            telephone_number: translate(`accessibility.vars.${envData.client_key}.telephone_number`),
        };
    }, [envData.client_key, translate]);

    return (
        <BlockShowcase
            breadcrumbItems={[
                { name: translate('accessibility.breadcrumbs.home'), state: 'home' },
                { name: translate('accessibility.breadcrumbs.accessibility') },
            ]}>
            {page && (
                <div className="section">
                    <div
                        className={`flex flex-vertical ${
                            page.description_position == 'after' ? 'flex-vertical-reverse' : ''
                        }`}>
                        {page && <CmsBlocks page={page} largeMarkdown={true} />}

                        {(!page.description_html || page.description_position !== 'replace') && (
                            <div className={'wrapper'}>
                                <div className="section-title text-left">{translate('accessibility.title')}</div>
                                <div className="block block-accessibility">
                                    <div className="block-text">
                                        <p className="description">
                                            {translate('accessibility.content.introParagraph1', {
                                                organization_name: vars?.organization_name,
                                            })}
                                        </p>
                                        <p className="description">
                                            {translate('accessibility.content.introParagraph2', {
                                                implementation_name: vars?.implementation_name,
                                                organization_name: vars?.organization_name,
                                            })}
                                        </p>
                                        <p className="description">
                                            {translate('accessibility.content.linksIntro', {
                                                implementation_name: vars?.implementation_name,
                                                organization_name: vars?.organization_name,
                                            })}
                                        </p>
                                        <ul>
                                            <li>{translate('accessibility.content.mainDomainTitle')}</li>
                                            <ul>
                                                <li>
                                                    <a href={vars?.website} target="_blank" rel="noreferrer">
                                                        {vars?.website}
                                                    </a>
                                                </li>
                                            </ul>
                                        </ul>
                                        <p />
                                        <p className="description">
                                            {translate('accessibility.content.accessibilityOverview', {
                                                organization_name: vars?.organization_name,
                                            })}
                                            <a href={vars?.accessibility_link} target="_blank" rel="noreferrer">
                                                {vars?.accessibility_link}
                                            </a>
                                        </p>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.complianceStatusTitle')}
                                        </div>
                                        <div className="description">
                                            {translate('accessibility.content.complianceStatusDescription1', {
                                                organization_name: vars?.organization_name,
                                            })}
                                        </div>
                                        <div className="description">
                                            {translate('accessibility.content.complianceStatusDescription2')}
                                        </div>
                                        <div className="description">
                                            <TranslateHtml
                                                i18n={'accessibility.content.complianceStatusLinkDescription'}
                                            />
                                        </div>
                                    </div>

                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.declarationTitle')}
                                        </div>
                                        <div className="description">
                                            {translate('accessibility.content.declarationDescription1', {
                                                date: '07-02-2020',
                                                organization_name: vars?.organization_name,
                                            })}
                                        </div>
                                        <div className="description">
                                            {translate('accessibility.content.declarationDescription2', {
                                                revision_date: '01-01-2020',
                                            })}
                                        </div>
                                    </div>

                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.feedbackAndContactTitle')}
                                        </div>
                                        <div className="description">
                                            {translate('accessibility.content.feedbackAndContactDescription')}
                                        </div>
                                        <div className="description">
                                            <TranslateHtml
                                                i18n={'accessibility.content.feedbackAndContactEmail'}
                                                values={{
                                                    contact_email: vars?.contact_email,
                                                    telephone_number: vars?.telephone_number,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.expectationsTitle')}
                                        </div>
                                        <ul>
                                            <li>{translate('accessibility.content.expectationsList1')}</li>
                                            <li>{translate('accessibility.content.expectationsList2')}</li>
                                            <li>{translate('accessibility.content.expectationsList3')}</li>
                                        </ul>
                                    </div>

                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.enforcementProcedureTitle')}
                                        </div>
                                        <div className="description">
                                            {translate('accessibility.content.enforcementProcedureDescription1')}
                                        </div>
                                        <div className="description">
                                            <TranslateHtml
                                                i18n={'accessibility.content.enforcementProcedureDescription2'}
                                            />
                                        </div>
                                    </div>

                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.explanationComplianceStatusTitle')}
                                        </div>
                                        <div className="description">
                                            {translate('accessibility.content.explanationComplianceStatusDescription1')}
                                        </div>
                                        <div className="description">
                                            {translate(
                                                'accessibility.content.explanationComplianceStatusDescription2',
                                                {
                                                    implementation_name: vars?.implementation_name,
                                                    organization_name: vars?.organization_name,
                                                },
                                            )}
                                        </div>
                                        <ol>
                                            <li>{translate('accessibility.content.complianceCriteria1')}</li>
                                            <li>{translate('accessibility.content.complianceCriteria2')}</li>
                                            <li>
                                                <TranslateHtml i18n={'accessibility.content.complianceCriteria3'} />
                                            </li>
                                            <li>
                                                <TranslateHtml i18n={'accessibility.content.complianceCriteria4'} />
                                            </li>
                                            <li>
                                                <TranslateHtml i18n={'accessibility.content.complianceCriteria5'} />
                                            </li>
                                            <li>{translate('accessibility.content.complianceCriteria6')}</li>
                                            <div className="description">
                                                {translate('accessibility.content.referenceNumber')}
                                            </div>
                                            <ul>
                                                <li>{translate('accessibility.content.description')}</li>
                                                <li>{translate('accessibility.content.cause')}</li>
                                                <li>{translate('accessibility.content.effect')}</li>
                                                <li>{translate('accessibility.content.alternative')}</li>
                                                <li>{translate('accessibility.content.measure')}</li>
                                                <ul>
                                                    <li>
                                                        <TranslateHtml
                                                            i18n={'accessibility.content.disproportionateBurden'}
                                                        />
                                                    </li>
                                                </ul>
                                                <li>{translate('accessibility.content.planning')}</li>
                                            </ul>
                                            <li>
                                                <TranslateHtml i18n={'accessibility.content.deviations'} />
                                            </li>
                                            <li>
                                                <TranslateHtml i18n={'accessibility.content.available_online'} />
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="block-text">
                                        <p className="description">
                                            {translate('accessibility.content.deviationsTitle')}
                                        </p>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.technicalDeviationsTitle')}
                                        </div>
                                        <ol>
                                            <li>
                                                <strong>{translate('accessibility.content.sc1_1_1.title')}</strong>
                                                <ul>
                                                    <li>{translate('accessibility.content.sc1_1_1.description')}</li>
                                                    <li>{translate('accessibility.content.sc1_1_1.cause')}</li>
                                                    <li>{translate('accessibility.content.sc1_1_1.effect')}</li>
                                                    <li>{translate('accessibility.content.sc1_1_1.alternative')}</li>
                                                    <li>{translate('accessibility.content.sc1_1_1.measure')}</li>
                                                    <li>
                                                        {translate(
                                                            'accessibility.content.sc1_1_1.disproportionateBurden',
                                                        )}
                                                    </li>
                                                    <li>{translate('accessibility.content.sc1_1_1.planning')}</li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>{translate('accessibility.content.sc4_1_2_1.title')}</strong>
                                                <ul>
                                                    <li>{translate('accessibility.content.sc4_1_2_1.description')}</li>
                                                    <li>{translate('accessibility.content.sc4_1_2_1.cause')}</li>
                                                    <li>{translate('accessibility.content.sc4_1_2_1.effect')}</li>
                                                    <li>{translate('accessibility.content.sc4_1_2_1.alternative')}</li>
                                                    <li>{translate('accessibility.content.sc4_1_2_1.measure')}</li>
                                                    <li>
                                                        {translate(
                                                            'accessibility.content.sc4_1_2_1.disproportionateBurden',
                                                        )}
                                                    </li>
                                                    <li>{translate('accessibility.content.sc4_1_2_1.planning')}</li>
                                                </ul>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="block-text">
                                        <div className="title">
                                            {translate('accessibility.content.outsideScopeTitle')}
                                        </div>
                                        <div className="description">
                                            <a href={translate('accessibility.content.outsideScopeLink')}>
                                                {translate('accessibility.content.outsideScopeDescription')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
