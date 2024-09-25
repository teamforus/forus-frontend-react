import React from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function BlockProject() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-project">
            <div className="block-project-content">
                <div className="block-project-label">Nieuws</div>
                <div className="block-project-details">
                    <div className="block-project-title">Naar een merkbaar en meetbaar verschil!</div>
                    <div className="block-project-description">
                        Project gefinancierd door het Innovatiebudget 2023 in samenwerking met Gemeente Eemsdelta en
                        Gemeente Westerkwartier.
                    </div>
                </div>
                <div className="block-project-actions">
                    <StateNavLink name={'about-us-innovation'} className="button button-light-outline">
                        Lees meer
                    </StateNavLink>
                </div>
            </div>

            <div className="block-project-image">
                <img src={assetUrl(`/assets/img/project-block.jpg`)} alt="" />
            </div>
        </div>
    );
}
