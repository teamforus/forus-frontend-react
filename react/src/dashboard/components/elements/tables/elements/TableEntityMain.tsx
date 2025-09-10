import { strLimit } from '../../../../helpers/string';
import React, { Fragment, useMemo } from 'react';
import Media from '../../../../props/models/Media';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';

export default function TableEntityMain({
    media = false,
    mediaSize = 'sm',
    mediaRound = true,
    mediaBorder = true,
    mediaPlaceholder,
    title,
    titleLimit = 64,
    subtitle,
    subtitleLimit = 64,
    subtitleProperties,
    collapsed = null,
    collapsedClicked = null,
}: {
    media?: Media | false;
    mediaSize?: 'sm' | 'md';
    mediaRound?: boolean;
    mediaBorder?: boolean;
    mediaPlaceholder?: 'fund' | 'organization' | 'product' | 'form' | 'physical_card_type';
    title: string;
    titleLimit?: number;
    subtitle?: string;
    subtitleLimit?: number;
    subtitleProperties?: Array<{ label: string; value: string | number }>;
    collapsed?: boolean;
    collapsedClicked?: (e: React.MouseEvent) => void;
}) {
    const assetUrl = useAssetUrl();

    const thumbnailUrl = useMemo(() => {
        const thumbnails = {
            form: assetUrl('/assets/img/icon-fund-form.svg'),
            fund: assetUrl('/assets/img/placeholders/fund-thumbnail.png'),
            product: assetUrl('/assets/img/placeholders/product-thumbnail.png'),
            organization: assetUrl('/assets/img/placeholders/organization-thumbnail.png'),
            physical_card_type: assetUrl('/assets/img/placeholders/physical-card-type.svg'),
        };

        return thumbnails[mediaPlaceholder] || null;
    }, [assetUrl, mediaPlaceholder]);

    return (
        <div className="td-entity-main">
            {collapsed !== null && (
                <div className="td-entity-main-collapse" onClick={collapsedClicked}>
                    {collapsed ? <em className="mdi mdi-menu-right" /> : <em className="mdi mdi-menu-down" />}
                </div>
            )}

            {media !== false && (
                <div className="td-entity-main-media">
                    <img
                        className={classNames(
                            'td-media',
                            mediaSize === 'sm' && 'td-media-sm',
                            mediaSize === 'md' && 'td-media-md',
                            mediaRound && 'td-media-round',
                            !mediaBorder && 'td-media-borderless',
                        )}
                        src={media?.sizes.thumbnail || thumbnailUrl}
                        alt={''}
                    />
                </div>
            )}

            <div className="td-entity-main-content">
                <div className="text-strong text-primary" title={title}>
                    {strLimit(title, titleLimit)}
                </div>

                <div className="text-muted-dark" title={subtitle}>
                    {strLimit(subtitle, subtitleLimit)}
                </div>

                {subtitleProperties?.length > 0 && (
                    <div className={'td-entity-properties'}>
                        {subtitleProperties?.map((property, index) => (
                            <Fragment key={index}>
                                <div className={'td-entity-property'}>
                                    <div className={'td-entity-property-label'}>{property.label}</div>
                                    <div className={'td-entity-property-value'}>{property.value?.toString()}</div>
                                </div>
                                {index < subtitleProperties?.length - 1 && (
                                    <span className={'td-entity-property-separator'} />
                                )}
                            </Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
