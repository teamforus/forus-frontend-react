import React, { Fragment, useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import { strLimit } from '../../../../../../dashboard/helpers/string';
import FundsListItemModel from '../../../../../services/types/FundsListItemModel';
import { uniqueId } from 'lodash';

export default function FundsListItemList({
    fund,
    applyFund,
    searchParams,
}: {
    fund?: FundsListItemModel;
    applyFund?: (event: React.MouseEvent, fund: FundsListItemModel) => void;
    searchParams?: object;
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
                    alt={`Dit is de afbeelding van ${fund.name}`}
                />
            </div>
            <div className="fund-content">
                <div className="fund-details">
                    <div className="fund-status-label">
                        {fund.canApply && !fund.showActivateButton && (
                            <div className="label label-light">{translate('funds.status.is_applicable')}</div>
                        )}

                        {fund.showActivateButton && (
                            <div className="label label-success">{translate('funds.status.activateable')}</div>
                        )}

                        {fund.alreadyReceived && (
                            <div className="label label-primary">{translate('funds.status.active')}</div>
                        )}

                        {fund.showPendingButton && (
                            <div className="label label-warning">{translate('funds.status.is_pending')}</div>
                        )}

                        {fund.showRequestButton && (
                            <div className="label label-light">{translate('funds.status.is_applicable')}</div>
                        )}
                    </div>

                    <h2 className="fund-name">
                        <StateNavLink
                            name={'fund'}
                            params={{ id: fund.id }}
                            state={{ searchParams: searchParams || null }}>
                            {fund.name}
                        </StateNavLink>
                    </h2>

                    {fund.description_short && (
                        <div className="fund-description">
                            <span id={showMoreId}>
                                {showMore ? fund.description_short : strLimit(fund.description_short, 190)}
                            </span>
                            <br />
                            {fund.description_short.length > 190 && (
                                <button
                                    className="button button-text button-xs"
                                    onClick={() => setShowMore(!showMore)}
                                    aria-expanded={showMore}
                                    aria-controls={showMoreId}>
                                    {showMore ? 'Toon minder' : 'Toon meer'}
                                    <em
                                        className={`mdi ${showMore ? 'mdi-chevron-up' : 'mdi-chevron-down'} icon-right`}
                                    />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {fund.showActivateButton && (
                    <div className="fund-actions">
                        <button
                            className="button button-primary button-xs"
                            type="button"
                            onClick={(e) => applyFund(e, fund)}>
                            {translate('funds.buttons.is_applicable')}
                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                        </button>
                    </div>
                )}

                {fund.showPendingButton && (
                    <div className="fund-actions">
                        <StateNavLink
                            name={'fund-requests'}
                            params={{ fund_id: fund.id }}
                            className="button button-text button-xs"
                            role="button"
                            ng-click="$dir.goToFundRequests($event)">
                            {translate('funds.buttons.check_status')}
                            <em className="mdi mdi-chevron-right icon-right" aria-hidden="true" />
                        </StateNavLink>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
