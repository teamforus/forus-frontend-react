import React, { useState } from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function RolesSelector({ activeType }: { activeType: string }) {
    const assetUrl = useAssetUrl();

    const [roleTypes] = useState([
        {
            key: 'requester',
            name: 'Aanvrager / Deelnemer',
        },
        {
            key: 'provider',
            name: 'Aanbieder',
        },
        {
            key: 'sponsor',
            name: 'Sponsor',
        },
        {
            key: 'validator',
            name: 'Beoordelaar',
        },
    ]);

    return (
        <div className="block block-roles-selector">
            {roleTypes.map((roleType, index) => (
                <StateNavLink name={`roles-${roleType.key}`} className={'block-roles-selector-item'} key={index}>
                    <img
                        src={assetUrl(
                            `/assets/img/icons-roles/selector/${roleType.key}-${
                                roleType.key === activeType ? 'active' : 'normal'
                            }.svg`,
                        )}
                        alt=""
                    />
                    {roleType.name}

                    {roleType.key === activeType && <div className="separator-bottom" />}
                </StateNavLink>
            ))}
        </div>
    );
}
