import React from 'react';
import TranslateHtml from '../../../../elements/translate-html/TranslateHtml';

export default function OrganizationsFundsShowMarkdownCard({ html }: { html: string }) {
    return (
        <div className="card-section">
            <div className="fund-description">
                {html && (
                    <div className="description-body">
                        <div className="arrow-box border bg-dim">
                            <div className="arrow" />
                        </div>

                        <div className="block block-markdown">
                            <TranslateHtml i18n={html} />
                        </div>
                    </div>
                )}

                {!html && (
                    <div className="description-body">
                        <div className="arrow-box border bg-dim">
                            <div className="arrow" />
                        </div>
                        Geen data
                    </div>
                )}
            </div>
        </div>
    );
}
