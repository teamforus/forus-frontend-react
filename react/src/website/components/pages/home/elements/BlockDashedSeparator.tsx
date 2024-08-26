import React from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';

export default function BlockDashedSeparator({
    image = true,
    demoButton = false,
}: {
    image?: boolean;
    demoButton?: boolean;
}) {
    const assetUrl = useAssetUrl();

    return (
        <div
            className={classNames(
                'block',
                'block-dashed-separator',
                !image && 'block-dashed-separator-empty',
                demoButton && 'block-dashed-separator-button',
            )}>
            {image && <img src={assetUrl(`/assets/img/icon-forus.svg`)} alt="" />}
            {demoButton && <div className="button button-primary">Gratis demo aanvragen</div>}
        </div>
    );
}
