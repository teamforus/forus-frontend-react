import React, { useMemo } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { useParams } from 'react-router';
import { snakeCase } from 'lodash';
import { getStateRouteUrl, useStateParams } from '../../../modules/state_router/Router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Error() {
    const params = useParams();
    const { customLink = null, hideHomeLinkButton = null } = useStateParams();
    const translate = useTranslate();

    const errorCode = useMemo(() => {
        return snakeCase(params.errorCode || '');
    }, [params?.errorCode]);

    const transParams = useMemo(() => {
        return {
            url_webshop_home: getStateRouteUrl(WebshopRoutes.HOME, {}),
            url_webshop_start: getStateRouteUrl(WebshopRoutes.START, {}),
            url_webshop_start_logout: getStateRouteUrl(WebshopRoutes.START, {}, { logout: 1, restore_with_digid: 1 }),
        };
    }, []);

    return (
        <BlockShowcase>
            <section className="section section-product">
                <div className="wrapper">
                    <div className="block block-sign_up">
                        <div className="block-wrapper">
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header text-danger">
                                    {translate(
                                        `error.titles.${errorCode}`,
                                        transParams,
                                        translate('error.titles.unknown_error'),
                                    )}
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <TranslateHtml
                                        component={<p className="sign_up-pane-text" />}
                                        i18n={`error.messages.${errorCode}`}
                                        i18nDefault={translate('error.titles.unknown_error')}
                                        values={transParams}
                                    />

                                    {(!hideHomeLinkButton || errorCode == 'digid_uid_used') && (
                                        <p className="sign_up-pane-text">
                                            {errorCode != 'digid_uid_used' ? (
                                                <StateNavLink name={WebshopRoutes.HOME} className="sign_up-pane-link">
                                                    {translate('error.home_button')}
                                                </StateNavLink>
                                            ) : (
                                                <StateNavLink
                                                    name={WebshopRoutes.START}
                                                    query={{ logout: 1, restore_with_digid: 1 }}
                                                    className="button button-primary">
                                                    {translate('error.start_button')}
                                                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                                </StateNavLink>
                                            )}
                                        </p>
                                    )}

                                    {customLink && (
                                        <p className="sign_up-pane-text">
                                            <StateNavLink
                                                name={customLink?.name}
                                                params={customLink?.params}
                                                className={
                                                    customLink?.button ? 'button button-primary' : 'sign_up-pane-link'
                                                }>
                                                {customLink?.button && customLink.icon && !customLink.iconRight && (
                                                    <em className={`mdi icon-left ${customLink.icon}`} />
                                                )}

                                                {customLink?.text || ''}

                                                {customLink?.button && customLink.icon && customLink.iconRight && (
                                                    <em className={`mdi icon-right ${customLink.icon}`} />
                                                )}
                                            </StateNavLink>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </BlockShowcase>
    );
}
