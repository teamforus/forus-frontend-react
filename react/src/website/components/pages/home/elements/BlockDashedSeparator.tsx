import React from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';

export default function BlockDashedSeparator({ image = true }: { image?: boolean }) {
    const assetUrl = useAssetUrl();

    return (
        <div className={classNames('block', 'block-dashed-separator', !image && 'block-dashed-separator-empty')}>
            {image && <img src={assetUrl(`/assets/img/icon-forus.svg`)} alt="" />}
        </div>
    );
}
