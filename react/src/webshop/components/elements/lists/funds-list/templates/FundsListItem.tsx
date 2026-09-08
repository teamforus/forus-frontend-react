import React, { Fragment, useCallback } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import { WebshopRoutes } from '../../../../../modules/state_router/RouterBuilder';
import Label from '../../../label/Label';
import useAppConfigs from '../../../../../hooks/useAppConfigs';
import { useNavigateState } from '../../../../../modules/state_router/Router';
import useFundMeta from '../../../../../hooks/meta/useFundMeta';
import Voucher from '../../../../../../dashboard/props/models/Voucher';
import Fund from '../../../../../props/models/Fund';
import PayoutTransaction from '../../../../../../dashboard/props/models/PayoutTransaction';
import useApplyFund from '../hooks/useApplyFund';

export default function FundsListItem({
    fund,
    funds,
    payouts,
    vouchers,
    forceShowImage = false,
}: {
    fund: Fund;
    funds: Array<Fund>;
    payouts: Array<PayoutTransaction>;
    vouchers: Array<Voucher>;
    forceShowImage: boolean;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const navigateState = useNavigateState();

    const appConfigs = useAppConfigs();
    const fundMeta = useFundMeta(fund, payouts, vouchers, appConfigs);

    const onApplySuccess = useCallback(
        (voucher: Voucher) => {
            if (funds.length === 1) {
                return navigateState(WebshopRoutes.VOUCHER, { number: voucher.number });
            }

            document.location.reload();
        },
        [funds.length, navigateState],
    );

    const applyFund = useApplyFund({ onApplied: onApplySuccess });

    if (!fundMeta) {
        return null;
    }

    return (
        <StateNavLink
            name={WebshopRoutes.FUND}
            params={{ id: fundMeta.id }}
            className={'funds-item'}
            dataDusk={`listFundsRow${fundMeta.id}`}
            dataAttributes={{ 'data-search-item': 1 }}>
            <div className="funds-content">
                {(appConfigs.show_fund_image_list || forceShowImage) && (
                    <div className="funds-photo">
                        <img
                            className="funds-photo-img"
                            src={
                                fundMeta?.logo?.sizes?.large ||
                                fundMeta?.logo?.sizes?.thumbnail ||
                                assetUrl('/assets/img/placeholders/fund-large.png')
                            }
                            alt=""
                        />
                    </div>
                )}

                <div className="funds-details">
                    <div className="funds-info">
                        <h2 className="funds-title">{fundMeta.name}</h2>

                        {fundMeta.description_short && (
                            <div className="funds-description">{fundMeta.description_short}</div>
                        )}
                    </div>

                    <div className="funds-actions">
                        {fundMeta.canApply && !fundMeta.showActivateButton && (
                            <Label type="light">{translate('list_blocks.fund_item_list.status.is_applicable')}</Label>
                        )}

                        {fundMeta.showActivateButton && (
                            <Label type="success">{translate('list_blocks.fund_item_list.status.activateable')}</Label>
                        )}

                        {fundMeta.alreadyReceived && (
                            <Label type="primary">{translate('list_blocks.fund_item_list.status.active')}</Label>
                        )}

                        {fundMeta.showPendingButton && (
                            <Label type="warning">{translate('list_blocks.fund_item_list.status.is_pending')}</Label>
                        )}

                        {fundMeta.showRequestButton && (
                            <Label type="light">{translate('list_blocks.fund_item_list.status.is_applicable')}</Label>
                        )}

                        <div>
                            {fundMeta.showActivateButton || fundMeta.showPendingButton ? (
                                <Fragment>
                                    {fundMeta.showActivateButton && (
                                        <button
                                            type="button"
                                            data-dusk="activateButton"
                                            className="button button-text funds-button-link"
                                            onClick={(e) => applyFund(e, fundMeta)}>
                                            {translate('list_blocks.fund_item_list.buttons.is_applicable')}
                                        </button>
                                    )}

                                    {fundMeta.showPendingButton && (
                                        <StateNavLink
                                            customElement={'button'}
                                            name={WebshopRoutes.FUND_REQUESTS}
                                            dataDusk="pendingButton"
                                            params={{ fund_id: fundMeta.id }}
                                            className="button button-text button-xs funds-button-link">
                                            {translate('list_blocks.fund_item_list.buttons.check_status')}
                                            <em className="mdi mdi-chevron-right icon-right" aria-hidden="true" />
                                        </StateNavLink>
                                    )}
                                </Fragment>
                            ) : (
                                <StateNavLink
                                    customElement={'button'}
                                    name={WebshopRoutes.FUND}
                                    params={{ id: fundMeta.id }}
                                    className="button button-text button-xs funds-button-link">
                                    {translate('list_blocks.fund_item_list.buttons.more_information')}
                                </StateNavLink>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StateNavLink>
    );
}
