import React, { Fragment, useEffect, useRef, useState } from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function PageSelector({ activeType }: { activeType: string }) {
    const assetUrl = useAssetUrl();

    const selectorRef = useRef<HTMLDivElement>(null);

    const [pageTypes] = useState([
        {
            key: 'me-app',
            name: 'Me-app',
            stateName: 'me-app',
        },
        {
            key: 'cms',
            name: 'CMS',
            stateName: 'cms',
        },
        {
            key: 'funds',
            name: 'Fondsen',
            stateName: 'funds',
        },
        {
            key: 'information',
            name: 'Managementinformatie',
            mobileName: 'Statistieken',
            stateName: 'information',
        },
        {
            key: 'website',
            name: 'Websites',
            stateName: 'website',
        },
    ]);

    useEffect(() => {
        selectorRef?.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    return (
        <div className="block block-roles-selector" id="block-selector" ref={selectorRef}>
            {pageTypes.map((pageType, index) => (
                <StateNavLink
                    name={pageType.stateName}
                    query={{ scroll_to: 'block-selector' }}
                    className={'block-roles-selector-item'}
                    key={index}>
                    <img
                        src={assetUrl(
                            `/assets/img/icons-basic-functions/selector/${pageType.key}-${
                                pageType.key === activeType ? 'active' : 'normal'
                            }.svg`,
                        )}
                        alt=""
                    />
                    {!pageType.mobileName ? (
                        <span>{pageType.name}</span>
                    ) : (
                        <Fragment>
                            <span className="hide-sm">{pageType.name}</span>
                            <span className="show-sm">{pageType.mobileName}</span>
                        </Fragment>
                    )}

                    {pageType.key === activeType && <div className="separator-bottom" />}
                </StateNavLink>
            ))}
        </div>
    );
}
