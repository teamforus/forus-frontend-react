import React, { useMemo } from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import classNames from 'classnames';

export default function RolesBanner({
    type,
    title,
    description,
    showActions = true,
    showIcon = true,
}: {
    type: 'requester' | 'sponsor' | 'provider' | 'validator' | 'main';
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
        <div
            className={classNames(
                'block',
                'block-role-banner',
                type === 'requester' && 'block-role-banner-requester',
                type === 'sponsor' && 'block-role-banner-sponsor',
                type === 'provider' && 'block-role-banner-provider',
                type === 'validator' && 'block-role-banner-validator',
            )}>
            <div className="banner-content">
                <div className="banner-info">
                    {showIcon && (
                        <div className="banner-icon">
                            <img
                                src={assetUrl(`/assets/img/icons-roles/selector/${type}-active.svg`)}
                                alt={`Icoon van de ${iconTypeText}rol in het Forus-systeem`}
                            />
                        </div>
                    )}
                    <h2 className="banner-title">{title}</h2>
                    <div
                        className="banner-description banner-description-sm"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />

                    {showActions && (
                        <div className="banner-actions">
                            <div className="button button-primary">Gratis demo</div>
                            <div className="button button-dark">Lees ons verhaal</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="banner-media">
                <div className="banner-media-overlay" />
                <div className="banner-media-image" />
            </div>
        </div>
    );
}
