import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import { strLimit } from '../../../../../../dashboard/helpers/string';
import FundsListItemModel from '../../../../../services/types/FundsListItemModel';
import { uniqueId } from 'lodash';
import { WebshopRoutes } from '../../../../../modules/state_router/RouterBuilder';
import Label from '../../../label/Label';

export default function FundsListItemList({
    fund,
    applyFund,
}: {
    fund?: FundsListItemModel;
    applyFund?: (event: React.MouseEvent, fund: FundsListItemModel) => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const [showMore, setShowMore] = useState(false);
    const [showMoreId] = useState(uniqueId('fund_description_short_'));

    return (
        <Fragment>
            <div className="fund-photo">
                <img
                    src={
                        fund?.logo?.sizes?.thumbnail ||
                        fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                    }
                    alt=""
                />
            </div>
            <div className="fund-content">
                <div className="fund-details">
                    <div className="fund-status-label">
                        {fund.canApply && !fund.showActivateButton && (
                            <Label type="light">{translate('list_blocks.fund_item_list.status.is_applicable')}</Label>
                        )}

                        {fund.showActivateButton && (
                            <Label type="success">{translate('list_blocks.fund_item_list.status.activateable')}</Label>
                        )}

                        {fund.alreadyReceived && (
                            <Label type="primary">{translate('list_blocks.fund_item_list.status.active')}</Label>
                        )}

                        {fund.showPendingButton && (
                            <Label type="warning">{translate('list_blocks.fund_item_list.status.is_pending')}</Label>
                        )}

                        {fund.showRequestButton && (
                            <Label type="light">{translate('list_blocks.fund_item_list.status.is_applicable')}</Label>
                        )}
                    </div>

                    <h2 className="fund-name">{fund.name}</h2>

                    {fund.description_short && (
                        <div className="fund-description">
                            <span id={showMoreId}>
                                {showMore ? fund.description_short : strLimit(fund.description_short, 190)}
                            </span>
                            <br />
                            {fund.description_short.length > 190 && (
                                <button
                                    type={'button'}
                                    className="button button-text button-xs"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowMore(!showMore);
                                    }}
                                    aria-expanded={showMore}
                                    aria-controls={showMoreId}>
                                    {showMore
                                        ? translate('list_blocks.fund_item_list.show_less')
                                        : translate('list_blocks.fund_item_list.show_more')}
                                    <em
                                        className={classNames(
                                            'mdi',
                                            showMore ? 'mdi-chevron-up' : 'mdi-chevron-down',
                                            'icon-right',
                                        )}
                                    />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {fund.showActivateButton && (
                    <div className="fund-actions">
                        <button
                            type="button"
                            data-dusk="activateButton"
                            className="button button-primary button-xs"
                            onClick={(e) => applyFund(e, fund)}>
                            {translate('list_blocks.fund_item_list.buttons.is_applicable')}
                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                        </button>
                    </div>
                )}

                {fund.showPendingButton && (
                    <div className="fund-actions">
                        <StateNavLink
                            customElement={'button'}
                            name={WebshopRoutes.FUND_REQUESTS}
                            dataDusk="pendingButton"
                            params={{ fund_id: fund.id }}
                            className="button button-text button-xs">
                            {translate('list_blocks.fund_item_list.buttons.check_status')}
                            <em className="mdi mdi-chevron-right icon-right" aria-hidden="true" />
                        </StateNavLink>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
