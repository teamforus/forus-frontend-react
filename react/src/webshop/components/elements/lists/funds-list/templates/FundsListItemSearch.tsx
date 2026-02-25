import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundsListItemModel from '../../../../../services/types/FundsListItemModel';
import Label from '../../../label/Label';

export default function FundsListItemSearch({
    fund,
    applyFund,
}: {
    fund?: FundsListItemModel;
    applyFund?: (event: React.MouseEvent, fund: FundsListItemModel) => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <Fragment>
            <div className="search-media">
                <img
                    src={
                        fund?.logo?.sizes?.thumbnail ||
                        fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                    }
                    alt=""
                />
            </div>
            <div className="search-content">
                <div className="search-details">
                    <h2 className="search-title">{fund.name}</h2>
                    <div className="search-subtitle">{fund.organization?.name}</div>
                    <div className="search-status-label">
                        {fund.showPendingButton && (
                            <Label type="default">{translate('list_blocks.fund_item_search.buttons.is_pending')}</Label>
                        )}

                        {fund.alreadyReceived && (
                            <Label type="success">{translate('list_blocks.fund_item_search.status.active')}</Label>
                        )}
                    </div>
                </div>
                {fund.showActivateButton && (
                    <div className="search-actions">
                        <button
                            className="button button-primary button-fill"
                            type="button"
                            onClick={(e) => applyFund(e, fund)}>
                            {translate('list_blocks.fund_item_search.buttons.is_applicable')}
                        </button>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
