import React, { Fragment, useMemo, useState } from 'react';
import useAssetUrl from '../../hooks/useAssetUrl';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import ModalCookieSettings from '../modals/ModalCookieSettings';

export default function CookiesPopup() {
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();

    const [analyticsCookiesStorageKey] = useState('analytics_cookies_accepted');
    const [generalCookiesStorageKey] = useState('general_cookies_accepted');

    const [analyticsCookiesAccepted, setAnalyticsCookiesAccepted] = useState(
        localStorage.getItem(analyticsCookiesStorageKey),
    );
    const [generalCookiesAccepted, setGeneralCookiesAccepted] = useState(
        localStorage.getItem(generalCookiesStorageKey),
    );
    const [isConfiguringCookies, setIsConfiguringCookies] = useState(false);

    const cookiesConfigured = useMemo(() => {
        return analyticsCookiesAccepted && generalCookiesAccepted;
    }, [analyticsCookiesAccepted, generalCookiesAccepted]);

    const configureCookies = () => {
        setIsConfiguringCookies(true);
        openModal((modal) => <ModalCookieSettings modal={modal} onCancel={() => setIsConfiguringCookies(false)} />);
    };

    return (
        <Fragment>
            {!cookiesConfigured && !isConfiguringCookies && (
                <div className="block block-cookies-accept">
                    <div className="block-cookies-accept-icon">
                        <img src={assetUrl('/assets/img/cookies-icon.svg')} alt="" />
                    </div>
                    <div className="block-cookies-accept-title">Wij gebruiken cookies</div>
                    <div className="block-cookies-accept-description">
                        Deze website maakt gebruik van cookies om de algehele gebruikerservaring te verbeteren
                    </div>
                    <div className="block-cookies-accept-buttons">
                        <div
                            className="button button-sm button-primary"
                            onClick={() => {
                                setAnalyticsCookiesAccepted('true');
                                setGeneralCookiesAccepted('true');
                                localStorage.setItem(analyticsCookiesStorageKey, 'true');
                                localStorage.setItem(generalCookiesStorageKey, 'true');
                            }}>
                            Accepteren en doorgaan
                        </div>
                        <div
                            className="button button-sm button-light"
                            onClick={() => {
                                setAnalyticsCookiesAccepted('false');
                                setGeneralCookiesAccepted('false');
                                localStorage.setItem(analyticsCookiesStorageKey, 'false');
                                localStorage.setItem(generalCookiesStorageKey, 'false');
                            }}>
                            Alleen noodzakelijke cookies
                        </div>
                    </div>
                    <div className="block-cookies-accept-manage-cookies" onClick={() => configureCookies()}>
                        Beheer cookies
                        <em className="mdi mdi-open-in-new" />
                    </div>
                </div>
            )}
        </Fragment>
    );
}
