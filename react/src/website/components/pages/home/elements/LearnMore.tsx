import React from 'react';

export default function LearnMore() {
    return (
        <div className="block block-learn-more">
            <div className="block-learn-more-info">
                <div className="block-learn-more-title">Klaar om uw impact te vergroten?</div>
                <div className="block-learn-more-subtitle">
                    Laten we samen kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.
                </div>
            </div>

            <div className="block-learn-more-actions">
                <div className="button-group flex flex-vertical">
                    <div className="button button-primary text-center">Gratis demo aanvragen</div>
                    <div className="button button-gray text-center hide-sm">
                        Leer meer over ons platform
                        <em className="mdi mdi-arrow-right icon-right" />
                    </div>
                </div>
            </div>
        </div>
    );
}
