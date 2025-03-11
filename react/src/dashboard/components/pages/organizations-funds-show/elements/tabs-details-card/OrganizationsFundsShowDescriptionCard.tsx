import React from 'react';
import Fund from '../../../../../props/models/Fund';
import TranslateHtml from '../../../../elements/translate-html/TranslateHtml';

export default function OrganizationsFundsShowDescriptionCard({ fund }: { fund: Fund }) {
    return (
        <div className="card-section">
            <div className="fund-description">
                {fund.description_html && (
                    <div className="description-body">
                        <div className="arrow-box border bg-dim">
                            <div className="arrow" />
                        </div>

                        <div className="block block-markdown">
                            <TranslateHtml i18n={fund.description_html} />
                        </div>
                    </div>
                )}

                {!fund.description_html && (
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
