import React, { useMemo } from 'react';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import Label from '../../../elements/label/Label';

export default function FundRequestCard({ fundRequest }: { fundRequest: FundRequest }) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const notAnsweredCount = useMemo(() => {
        return fundRequest?.records
            .map((record) => record.clarifications.filter((item) => item.state !== 'answered').length)
            .reduce((a, b) => a + b, 0);
    }, [fundRequest?.records]);

    return (
        <StateNavLink
            className="fund-request-item"
            dataDusk={`listFundRequestsRow${fundRequest.id}`}
            name={WebshopRoutes.FUND_REQUEST_SHOW}
            params={{ id: fundRequest.id }}
            dataAttributes={{ 'data-search-item': 1 }}>
            <div className="fund-request-image">
                <img
                    src={
                        fundRequest?.fund?.logo?.sizes?.thumbnail ||
                        fundRequest?.fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                    }
                    alt={translate('fund_requests.card.img_alt')}
                />
            </div>
            <div className="fund-request-container">
                <div className="fund-request-section">
                    <div className="fund-request-details">
                        <div className="fund-request-name">{fundRequest.fund.name}</div>
                        <div className="fund-request-subtitle">
                            {translate('fund_requests.card.id')} <strong>{`#${fundRequest.id}`}</strong>
                        </div>
                    </div>
                    <div className="fund-request-overview">
                        {fundRequest.state === 'pending' && <Label type="warning">{fundRequest.state_locale}</Label>}
                        {fundRequest.state === 'approved' && <Label type="success">{fundRequest.state_locale}</Label>}
                        {fundRequest.state === 'declined' && <Label type="default">{fundRequest.state_locale}</Label>}
                        {fundRequest.state === 'disregarded' && <Label type="danger">{fundRequest.state_locale}</Label>}
                    </div>
                </div>
                <div className="fund-request-values">
                    <div className="fund-request-values-label">
                        {notAnsweredCount > 0 && (
                            <Label type="primary" size="xl">
                                <span className="label-blink" aria-hidden="true" />
                                {translate('fund_requests.card.questions_count', { count: notAnsweredCount })}
                            </Label>
                        )}
                    </div>
                    <div className="fund-request-values-date">
                        <div className="fund-request-value-title">{translate('fund_requests.card.created_at')}</div>
                        <div className="fund-request-value">{fundRequest.created_at_locale}</div>
                    </div>
                </div>
            </div>
            <div className="fund-request-footer">
                <div className="fund-request-values-date">
                    <div className="fund-request-value-title">{translate('fund_requests.card.created_at')}</div>
                    <div className="fund-request-value">{fundRequest.created_at_locale}</div>
                </div>
                <div className="fund-request-values-label">
                    {notAnsweredCount > 0 && (
                        <Label type="primary" size="xl">
                            <span className="label-blink" aria-hidden="true" />
                            {translate('fund_requests.card.questions_count', { count: notAnsweredCount })}
                        </Label>
                    )}
                </div>
            </div>
        </StateNavLink>
    );
}
