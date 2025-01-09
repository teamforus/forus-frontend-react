import React, { useCallback, useEffect, useState } from 'react';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Markdown from '../../elements/markdown/Markdown';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import useEnvData from '../../../hooks/useEnvData';
import { uniqueId } from 'lodash';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';

export default function Explanation() {
    const envData = useEnvData();
    const translate = useTranslate();
    const fundService = useFundService();

    const page = useCmsPage('explanation');
    const [visibleFaq, setVisibleFaq] = useState({});

    const [defaultFaq, setDefaultFaq] = useState<Array<{ id?: string; title?: string; description?: string }>>([]);

    const [defaultQuestionKeys] = useState([
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
    ]);

    const transformDefaultQuestion = useCallback(
        (index, fund, start_date) => {
            const key = defaultQuestionKeys[index];
            const titleKey = `home.faq.${envData.client_key}.faq_${key}`;
            const contentKey = `home.faq.${envData.client_key}.${key}`;

            return {
                id: uniqueId('faq_default_'),
                title: translate(titleKey, { fund }, `home.faq.faq_${key}`),
                description: translate(contentKey, { fund, start_date }, `home.faq.${key}`),
            };
        },
        [defaultQuestionKeys, envData.client_key, translate],
    );

    const makeDefaultFAQ = useCallback(
        (funds: Array<Fund>) => {
            const list = [...Array(14).keys()].map((i) => {
                return transformDefaultQuestion(i, funds[0].name, funds[0].start_date_locale);
            });

            if (['winterswijk', 'oostgelre', 'berkelland'].includes(envData.client_key)) {
                list.push(transformDefaultQuestion(14, funds[0].name, funds[0].start_date_locale));
            }

            setDefaultFaq(list);
        },
        [envData?.client_key, transformDefaultQuestion],
    );

    useEffect(() => {
        fundService.list().then((res) => makeDefaultFAQ(res.data.data));
    }, [fundService, makeDefaultFAQ]);

    return (
        <BlockShowcase
            wrapper={true}
            breadcrumbItems={[
                { name: translate('explanation.breadcrumbs.home'), state: 'home' },
                { name: translate('explanation.breadcrumbs.explanation') },
            ]}>
            {page && (
                <div className="section">
                    <div
                        className={`flex flex-vertical ${
                            page.description_position == 'after' ? 'flex-vertical-reverse' : ''
                        }`}>
                        {page && <CmsBlocks page={page} wrapper={false} />}

                        {(!page.description_html || page.description_position !== 'replace' || page.faq.length > 0) && (
                            <section className="section section-faq">
                                <div className="section-splash" />
                                <h1 className="section-title">{translate('home.faq.title', { client_key: '' })}</h1>
                                {page.faq?.length > 0 ? (
                                    <div className="faq">
                                        {page.faq.map((faq) => (
                                            <div
                                                key={faq.id}
                                                className={`faq-item ${visibleFaq?.[faq.id] ? 'active' : ''}`}
                                                onClick={() => {
                                                    setVisibleFaq({
                                                        ...visibleFaq,
                                                        [faq.id]: !visibleFaq?.[faq.id],
                                                    });
                                                }}>
                                                <div className="faq-item-header">
                                                    <span aria-expanded={visibleFaq?.[faq.id]} role="button">
                                                        {faq.title}
                                                    </span>
                                                    <div
                                                        className="faq-item-chevron-down mdi mdi-chevron-down"
                                                        aria-hidden="true"
                                                    />
                                                    <div
                                                        className="faq-item-chevron-up mdi mdi-chevron-up"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <div className="faq-item-content">
                                                    <Markdown
                                                        content={faq.description_html}
                                                        aria-labelledby={faq.title}
                                                        role="region"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="faq">
                                        {defaultFaq.map((faq) => (
                                            <div
                                                key={faq.id}
                                                className={`faq-item ${visibleFaq?.[faq.id] ? 'active' : ''}`}
                                                onClick={() => {
                                                    setVisibleFaq({
                                                        ...visibleFaq,
                                                        [faq.id]: !visibleFaq?.[faq.id],
                                                    });
                                                }}>
                                                <div className="faq-item-header">
                                                    <span aria-expanded={visibleFaq?.[faq.id]} role="button">
                                                        {faq.title}
                                                    </span>
                                                    <div
                                                        className="faq-item-chevron-down mdi mdi-chevron-down"
                                                        aria-hidden="true"
                                                    />
                                                    <div
                                                        className="faq-item-chevron-up mdi mdi-chevron-up"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <div className="faq-item-content">
                                                    <div className="block block-markdown">
                                                        <p role="region" aria-labelledby={faq.title}>
                                                            {faq.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
