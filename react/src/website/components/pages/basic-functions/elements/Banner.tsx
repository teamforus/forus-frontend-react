import React from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';

export default function Banner({
    type,
    title,
    description,
    labelText,
    showIcon = true,
    backgroundImgAltText = null,
}: {
    type: string;
    title: string;
    description: string;
    labelText?: string;
    showIcon?: boolean;
    backgroundImgAltText?: string;
}) {
    const assetUrl = useAssetUrl();

    return (
        <div
            className={classNames(
                'block',
                'block-basic-functions-banner',
                type === 'main' && 'block-basic-functions-banner-main',
                type === 'me-app' && 'block-basic-functions-banner-me-app',
                type === 'funds' && 'block-basic-functions-banner-funds',
                type === 'cms' && 'block-basic-functions-banner-cms',
                type === 'information' && 'block-basic-functions-banner-information',
                type === 'website' && 'block-basic-functions-banner-website',
            )}>
            <div className="banner-content">
                <div className="banner-info">
                    {showIcon && (
                        <div className="banner-icon">
                            <img
                                src={assetUrl(`/assets/img/icons-basic-functions/selector/${type}-active.svg`)}
                                alt={``}
                            />
                        </div>
                    )}
                    <h2 className="banner-title">{title}</h2>
                    {labelText && <div className="banner-label">{labelText}</div>}
                    <div className="banner-description banner-description-sm">{description}</div>
                </div>
            </div>

            <div className="banner-media">
                {type === 'main' && <div className="banner-media-overlay" />}
                <div className="banner-media-image" role="img" aria-label={backgroundImgAltText} />
            </div>
        </div>
    );
}
