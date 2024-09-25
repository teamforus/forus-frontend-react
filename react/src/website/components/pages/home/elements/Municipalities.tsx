import React from 'react';

import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function Municipalities() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-municipalities">
            <div className="block-municipalities-title">Het Forus-systeem in actie</div>
            <div className="block-municipalities-subtitle">Bekijk live toepassingen van het Forus-platform</div>

            <div className="block-municipalities-logo-list">
                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img src={assetUrl(`/assets/img/municipality-logos/fijnder.svg`)} alt="Logo van Fijnder" />
                    </div>
                    <div className="block-municipality-title">Fijnder</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img src={assetUrl(`/assets/img/municipality-logos/werkplein.svg`)} alt="Logo van Werkplein" />
                    </div>
                    <div className="block-municipality-title">Hart van West Brabant</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/geertruidenberg.svg`)}
                            alt="Logo van Gemeente Geertruidenberg"
                        />
                    </div>
                    <div className="block-municipality-title">Geertruidenberg</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/goeree-overflakkee.svg`)}
                            alt="Logo van Gemeente Goeree-Overflakkee"
                        />
                    </div>
                    <div className="block-municipality-title">Goeree-Overflakkee</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/heumen.svg`)}
                            alt="Logo van Gemeente Heumen"
                        />
                    </div>
                    <div className="block-municipality-title">Heumen</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/vergoedigen.svg`)}
                            alt="Logo van Gemeente Nijmegen"
                        />
                    </div>
                    <div className="block-municipality-title">Nijmegen</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/noordoostpolder.svg`)}
                            alt="Logo van Gemeente Noordoostpolder"
                        />
                    </div>
                    <div className="block-municipality-title">Noordoostpolder</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/oost-gelre.svg`)}
                            alt="Logo van Gemeente Oost Gelre"
                        />
                    </div>
                    <div className="block-municipality-title">Oost Gelre</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/berkelland.svg`)}
                            alt="Logo van Gemeente Berkelland"
                        />
                    </div>
                    <div className="block-municipality-title">Berkelland</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/eemsdelta.svg`)}
                            alt="Logo van Gemeente Eemsdelta"
                        />
                    </div>
                    <div className="block-municipality-title">Eemsdelta</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/westerkwartier.svg`)}
                            alt="Logo van Gemeente Westerkwartier"
                        />
                    </div>
                    <div className="block-municipality-title">Westerkwartier</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/waalwijk.svg`)}
                            alt="Logo van gemeente Waalwijk"
                        />
                    </div>
                    <div className="block-municipality-title">Waalwijk</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/winterswijk.svg`)}
                            alt="Logo van gemeente Winterswijk"
                        />
                    </div>
                    <div className="block-municipality-title">Winterswijk</div>
                </div>

                <div className="block-municipalities-logo">
                    <div className="block-municipalities-logo-image">
                        <img
                            src={assetUrl(`/assets/img/municipality-logos/schagen.svg`)}
                            alt="Logo van gemeente Schagen"
                        />
                    </div>
                    <div className="block-municipality-title">Schagen</div>
                </div>
            </div>
        </div>
    );
}
