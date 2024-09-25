import React, { useEffect, useRef, useState } from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function RolesSelector({ activeType }: { activeType: string }) {
    const assetUrl = useAssetUrl();

    const selectorRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        selectorRef?.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    return (
        <div className="block block-roles-selector" id="block-selector" ref={selectorRef}>
            {roleTypes.map((roleType, index) => (
                <StateNavLink
                    name={`roles-${roleType.key}`}
                    query={{ scroll_to: 'block-selector' }}
                    className={'block-roles-selector-item'}
                    key={index}>
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
