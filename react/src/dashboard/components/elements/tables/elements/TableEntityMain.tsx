import { strLimit } from '../../../../helpers/string';
import React, { useMemo } from 'react';
import Media from '../../../../props/models/Media';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';

export default function TableEntityMain({
    media = false,
    mediaSize = 'sm',
    mediaRound = true,
    mediaPlaceholder,
    title,
    subtitle,
    collapsed = null,
    collapsedClicked = null,
}: {
    media?: Media | false;
    mediaSize?: 'sm' | 'md';
    mediaRound?: boolean;
    mediaPlaceholder?: 'fund' | 'organization' | 'product';
    title: string;
    subtitle?: string;
    collapsed?: boolean;
    collapsedClicked?: (e: React.MouseEvent) => void;
}) {
    const assetUrl = useAssetUrl();

    const thumbnailUrl = useMemo(() => {
        const thumbnails = {
            fund: assetUrl('/assets/img/placeholders/fund-thumbnail.png'),
            product: assetUrl('/assets/img/placeholders/product-thumbnail.png'),
            organization: assetUrl('/assets/img/placeholders/organization-thumbnail.png'),
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
                        )}
                        src={media?.sizes.thumbnail || thumbnailUrl}
                        alt={''}
                    />
                </div>
            )}

            <div className="td-entity-main-content">
                <div className="text-strong text-primary" title={title}>
                    {strLimit(title, 50)}
                </div>
                <div className="text-muted-dark">{subtitle}</div>
            </div>
        </div>
    );
}
