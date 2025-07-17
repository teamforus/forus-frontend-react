import Markdown from '../markdown/Markdown';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import React, { useState } from 'react';
import Section from '../sections/Section';
import Faq from '../../../../dashboard/props/models/Faq';
import classNames from 'classnames';

export default function FaqBlock({ title, items }: { title: string; items?: Array<Faq> }) {
    const [visibleFaq, setVisibleFaq] = useState({});

    if (!items?.length) {
        return null;
    }

    return (
        <Section type={'faq'}>
            {title && <h2 className="section-title">{title}</h2>}

            <div className="block block-faq">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={classNames('faq-item', visibleFaq?.[item.id] && 'active')}
                        onClick={() => {
                            setVisibleFaq((list) => ({ ...list, [item.id]: !list?.[item.id] }));
                        }}
                        onKeyDown={clickOnKeyEnter}
                        role="button"
                        aria-expanded={!!visibleFaq?.[item.id]}
                        aria-controls={`faq_item_${item.id}`}
                        tabIndex={0}>
                        <div className="faq-item-header">
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
        </Section>
    );
}
