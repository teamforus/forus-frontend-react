import React, { useMemo } from 'react';
import Fund from '../../../../props/models/Fund';
import TranslateHtml from '../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import BlockShowcase from '../../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../../elements/block-loader/BlockLoader';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function FundRequestPersonBsnApiWarning({
    fund,
    prefillsError,
}: {
    fund: Fund;
    prefillsError: { key: string; message: string };
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const errorKey = useMemo(
        () =>
            ({
                not_found: 'not_found',
                connection_error: 'connection_error',
                taken_by_partner: 'taken_by_partner',
                not_filled_required_criteria: 'not_filled_required_criteria',
            })[prefillsError?.key] || 'connection_error',
        [prefillsError?.key],
    );

    return (
        <BlockShowcase breadcrumbItems={[]} loaderElement={<BlockLoader type={'full'} />}>
            <div className="block block-sign_up">
                <div className="block-wrapper">
                    <div className="sign_up-pane">
                        <div className="sign_up-pane-header">
                            <h2 className="sign_up-pane-header-title">
                                {translate(`fund_request.cards.${errorKey}.title`)}
                            </h2>
                        </div>
                        <div className="sign_up-pane-body text-center">
                            <p className="sign_up-pane-heading sign_up-pane-heading-lg">
                                {translate(`fund_request.cards.${errorKey}.heading`)}
                            </p>
                            <p className="sign_up-pane-text">
                                <TranslateHtml i18n={`fund_request.cards.${errorKey}.description`} />
                            </p>
                            <div className="block-icon">
                                <img src={assetUrl('/assets/img/icon-sign_up-error.svg')} alt="icon sign-up error" />
                            </div>
                            <p className="sign_up-pane-text text-center">
                                {translate(`fund_request.cards.${errorKey}.contacts`, {
                                    name: fund.organization.name,
                                })}
                            </p>
                            <div className="text-center">
                                <StateNavLink
                                    name={WebshopRoutes.FUNDS}
                                    className="button button-text button-text-primary button-text-padless">
                                    {translate('fund_request.cards.back')}
                                </StateNavLink>
                            </div>
                            <div className="form-group col col-lg-12 hidden-xs">
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BlockShowcase>
    );
}
