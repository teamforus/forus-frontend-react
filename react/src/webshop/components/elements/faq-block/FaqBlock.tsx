import Markdown from '../markdown/Markdown';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import React, { useMemo, useState } from 'react';
import Section from '../sections/Section';
import Faq from '../../../../dashboard/props/models/Faq';
import classNames from 'classnames';

export default function FaqBlock({ title, items }: { title: string; items?: Array<Faq> }) {
    const [visibleFaq, setVisibleFaq] = useState({});

    const faqGroups = useMemo((): Array<{ heading: Faq; questions: Array<Faq> }> => {
        let currentGroup = null;

        return items.reduce((groups, item) => {
            if (item.type === 'title') {
                currentGroup = { heading: item, questions: [] };
                return [...groups, currentGroup];
            }

            if (item.type === 'question') {
                if (!currentGroup) {
                    currentGroup = { heading: null, questions: [] };
                    groups.push(currentGroup);
                }

                currentGroup.questions.push(item);

                return groups;
            }
        }, []);
    }, [items]);

    if (!faqGroups?.length) {
        return null;
    }

    return (
        <Section type={'faq'}>
            {title && <h2 className="section-title">{title}</h2>}

            <div className="block block-faq">
                {faqGroups.map((group, index) => (
                    <div className="block-faq-group" key={index}>
                        {group.heading && (
                            <div className="block-faq-header">
                                <h3 className="block-faq-title">{group.heading.title}</h3>
                                <p className="block-faq-subtitle">{group.heading.subtitle}</p>
                            </div>
                        )}

                        {group.questions.map((item, index) => (
                            <div
                                key={index}
                                className={classNames('faq-item', visibleFaq?.[item.id] && 'active')}
                                aria-expanded={!!visibleFaq?.[item.id]}
                                aria-controls={`faq_item_${item.id}`}>
                                <div
                                    className="faq-item-header"
                                    onClick={() => {
                                        setVisibleFaq((list) => ({ ...list, [item.id]: !list?.[item.id] }));
                                    }}
                                    onKeyDown={clickOnKeyEnter}
                                    role="button"
                                    tabIndex={0}>
                                    <h2 className="faq-item-title">{item.title}</h2>
                                    <div className="faq-item-chevron">
                                        <em
                                            className={classNames(
                                                'mdi',
                                                visibleFaq?.[item.id] ? 'mdi-chevron-down' : 'mdi mdi-chevron-right',
                                            )}
                                        />
                                    </div>
                                </div>
                                <div
                                    className="faq-item-content"
                                    id={`faq_item_${item.id}`}
                                    aria-hidden={!visibleFaq?.[item.id]}>
                                    <Markdown content={item.description_html} />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Section>
    );
}
