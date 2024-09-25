import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useAssetUrl from '../../hooks/useAssetUrl';
import useFormBuilder from '../../../dashboard/hooks/useFormBuilder';
import usePushSuccess from '../../../dashboard/hooks/usePushSuccess';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function ModalCookieSettings({
    modal,
    className,
    onCancel,
}: {
    modal: ModalState;
    className?: string;
    onCancel: () => void;
}) {
    const assetUrl = useAssetUrl();
    const pushSuccess = usePushSuccess();

    const [analyticsCookiesStorageKey] = useState('analytics_cookies_accepted');
    const [generalCookiesStorageKey] = useState('general_cookies_accepted');

    const [showGeneralCookiesDescription, setShowGeneralCookiesDescription] = useState(false);
    const [showAnalyticsCookiesDescription, setShowAnalyticsCookiesDescription] = useState(false);

    const form = useFormBuilder({ generalCookiesAccepted: true, analyticsCookiesAccepted: true }, () => {
        const formValues = form.values;

        localStorage.setItem(generalCookiesStorageKey, formValues.generalCookiesAccepted ? 'true' : 'false');
        localStorage.setItem(analyticsCookiesStorageKey, formValues.analyticsCookiesAccepted ? 'true' : 'false');

        pushSuccess('Cookie-instellingen zijn opgeslagen');
    });

    const cancel = useCallback(() => {
        onCancel ? onCancel() : null;
        modal.close();
    }, [modal, onCancel]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-lg',
                'modal-animated',
                'modal-cookie-settings',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={cancel} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-header">
                    <div className="block-cookies-accept-icon">
                        <div className="block-cookies-accept-icon-wrapper">
                            <img src={assetUrl('/assets/img/cookies-icon.svg')} alt="" />
                        </div>
                        <div className="modal-close mdi mdi-close" onClick={cancel} role="button" />
                    </div>
                    <div className="modal-heading">Cookie-instellingen</div>
                    <div className="modal-heading-description">
                        Forus gebruikt cookies om de website optimaal te laten functioneren, uw gebruikservaring te
                        verbeteren en om geanonimiseerde statistieken te verzamelen.
                    </div>
                </div>
                <div className="modal-body">
                    <div className="modal-cookie-settings-block">
                        <div className="modal-cookie-settings-block-title">
                            We gebruiken alleen noodzakelijke en analytische cookies:
                        </div>
                        <div className="modal-cookie-settings-block-settings-list">
                            <div className="modal-cookie-settings-block-setting">
                                <div className="modal-cookie-settings-block-settings-title-wrapper">
                                    <div className="modal-cookie-settings-block-setting-title">
                                        Noodzakelijke cookies
                                    </div>
                                    <label
                                        key={'key'}
                                        className="cookie-option"
                                        htmlFor={`option_general_cookies`}
                                        role="checkbox"
                                        tabIndex={0}
                                        aria-checked={form.values.generalCookiesAccepted}>
                                        <div className="form-toggle">
                                            <input
                                                type="checkbox"
                                                tabIndex={-1}
                                                id={`option_general_cookies`}
                                                onChange={(e) => {
                                                    form.update({ generalCookiesAccepted: e.target.checked });
                                                }}
                                                checked={form.values.generalCookiesAccepted}
                                                disabled={true}
                                                aria-hidden="true"
                                            />
                                            <div className="form-toggle-inner flex-end">
                                                <div className="toggle-input">
                                                    <div className="toggle-input-dot">
                                                        {form.values.generalCookiesAccepted ? (
                                                            <em className="mdi mdi-check-bold" />
                                                        ) : (
                                                            <div className="icon-disabled" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {showGeneralCookiesDescription && (
                                    <div className="modal-cookie-settings-block-setting-description">
                                        Deze cookies zorgen ervoor dat de website basisfunctionaliteiten kan uitvoeren,
                                        zoals het navigeren tussen pagina&apos;s, het laden van content en het correct
                                        functioneren van formulieren.
                                    </div>
                                )}
                                <div
                                    className="modal-cookie-settings-expand"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowGeneralCookiesDescription(!showGeneralCookiesDescription);
                                    }}>
                                    <div className="modal-cookie-settings-expand-title">
                                        Bekijk {!showGeneralCookiesDescription ? 'meer' : 'minder'}
                                    </div>
                                    <em
                                        className={`mdi mdi-chevron-${showGeneralCookiesDescription ? 'up' : 'down'}`}
                                    />
                                </div>
                            </div>
                            <div className="modal-cookie-settings-block-setting">
                                <div className="modal-cookie-settings-block-settings-title-wrapper">
                                    <div className="modal-cookie-settings-block-setting-title">Analytische cookies</div>
                                    <label
                                        key={'key'}
                                        className="cookie-option"
                                        htmlFor={`option_analytics_cookies`}
                                        role="checkbox"
                                        tabIndex={0}
                                        aria-checked={form.values.analyticsCookiesAccepted}>
                                        <div className="form-toggle">
                                            <input
                                                type="checkbox"
                                                tabIndex={-1}
                                                id={`option_analytics_cookies`}
                                                onChange={(e) => {
                                                    form.update({ analyticsCookiesAccepted: e.target.checked });
                                                }}
                                                checked={form.values.analyticsCookiesAccepted}
                                                aria-hidden="true"
                                            />
                                            <div className="form-toggle-inner flex-end">
                                                <div className="toggle-input">
                                                    <div className="toggle-input-dot">
                                                        {form.values.analyticsCookiesAccepted ? (
                                                            <em className="mdi mdi-check-bold" />
                                                        ) : (
                                                            <div className="icon-disabled" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {showAnalyticsCookiesDescription && (
                                    <div className="modal-cookie-settings-block-setting-description">
                                        We gebruiken Google Analytics en Hotjar om geanonimiseerde statistieken te
                                        verzamelen over hoe bezoekers onze website gebruiken. Deze informatie helpt ons
                                        om de website te verbeteren en gebruiksvriendelijker te maken.
                                    </div>
                                )}
                                <div
                                    className="modal-cookie-settings-expand"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowAnalyticsCookiesDescription(!showAnalyticsCookiesDescription);
                                    }}>
                                    <div className="modal-cookie-settings-expand-title">
                                        Bekijk {!showAnalyticsCookiesDescription ? 'meer' : 'minder'}
                                    </div>
                                    <em
                                        className={`mdi mdi-chevron-${showAnalyticsCookiesDescription ? 'up' : 'down'}`}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-cookie-settings-block-description">
                            U kunt cookies te allen tijde weigeren of uitschakelen. Dit kunt u doen door de instellingen
                            van uw webbrowser aan te passen. Houd er rekening mee dat het uitschakelen van cookies de
                            functionaliteit van de website kan beïnvloeden.
                            <br />
                            <br />
                            Voor meer informatie over ons cookiebeleid leest u in ons{' '}
                            <StateNavLink
                                target={'_blank'}
                                name={'privacy'}
                                className="modal-cookie-settings-block-description-link"
                                rel="noreferrer">
                                Privacyverklaring.
                            </StateNavLink>
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <div className="button-group">
                        <button
                            type="submit"
                            className="button button-sm button-primary"
                            onClick={() => {
                                form.submit();
                                modal.close();
                            }}>
                            Accepteren en doorgaan
                        </button>
                        <button
                            className="button button-sm button-light"
                            type="button"
                            onClick={() => {
                                form.update({ generalCookiesAccepted: true, analyticsCookiesAccepted: false });
                            }}>
                            Alleen noodzakelijke cookies
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
