import Fund from '../../../../../dashboard/props/models/Fund';
import Markdown from '../../../elements/markdown/Markdown';
import React, { useState } from 'react';

export default function FundFaq({ fund }: { fund: Fund }) {
    const [visibleFaq, setVisibleFaq] = useState({});

    if (!fund.faq) return null;

    return (
        <section className="section section-faq">
            <div className="section-splash" />
            {fund.faq_title && <h2 className="section-title">{fund.faq_title}</h2>}
            <div className="faq faq-fund">
                {fund.faq.map((question, index) => (
                    <div
                        key={index}
                        className={`faq-item ${visibleFaq?.[question.id] ? 'active' : ''}`}
                        onClick={() => {
                            setVisibleFaq((list) => ({
                                ...list,
                                [question.id]: !list?.[question.id],
                            }));
                        }}
                        role="button"
                        aria-expanded={!!visibleFaq?.[question.id]}
                        aria-controls={`faq_item_${question.id}`}>
                        <div className="faq-item-header">
                            <h2 className="faq-item-title" role="button" tabIndex={0}>
                                {question.title}
                            </h2>
                            <em className="faq-item-chevron-down mdi mdi-chevron-down" />
                            <em className="faq-item-chevron-up mdi mdi-chevron-up" />
                        </div>
                        <div className="faq-item-content" id={`faq_item_${question.id}`}>
                            <Markdown content={question.description_html} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
