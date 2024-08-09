import React, { Fragment, useMemo } from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function RolesBanner({
    type,
    title,
    description,
    showActions = true,
    showIcon = true,
}: {
    type: string;
    title: string;
    description: string;
    showActions?: boolean;
    showIcon?: boolean;
}) {
    const assetUrl = useAssetUrl();

    const iconTypeText = useMemo(() => {
        switch (type) {
            case 'requester':
                return 'deelnemers';
            case 'sponsor':
                return 'sponsor';
            case 'provider':
                return 'aanbieders';
            case 'validator':
                return 'beoordelaards';
        }
    }, [type]);

    return (
        <Fragment>
            <div className="banner-image show-sm">
                <img src={assetUrl(`/assets/img/roles-${type}-banner-mobile.jpg`)} alt={'Requester role banner'} />
                <div className="banner-image-mask" />
            </div>

            <div className="section section-banner-right">
                <Fragment>
                    <div className="section-main">
                        {showIcon && (
                            <div className="section-icon">
                                <img
                                    src={assetUrl(`/assets/img/icons-roles/selector/${type}-active.svg`)}
                                    alt={`Icoon van de ${iconTypeText}rol in het Forus-systeem`}
                                />
                            </div>
                        )}
                        <h2 className="section-title">{title}</h2>
                        <div className="section-description section-description-sm">{description}</div>

                        {showActions && (
                            <div className="button-group">
                                <div className="button button-primary">Gratis demo</div>
                                <div className="button button-dark">Lees ons verhaal</div>
                            </div>
                        )}
                    </div>

                    <div className="section-banner hide-sm">
                        <img src={assetUrl(`/assets/img/roles-${type}-banner.png`)} alt={`${type} role banner`} />
                    </div>
                </Fragment>
            </div>
        </Fragment>
    );
}
