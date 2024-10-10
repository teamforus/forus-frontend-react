import React, { useMemo } from 'react';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function FundRequestCard({ fundRequest }: { fundRequest: FundRequest }) {
    const assetUrl = useAssetUrl();

    const notAnsweredCount = useMemo(() => {
        return fundRequest?.records
            .map((record) => record.clarifications.filter((item) => item.state !== 'answered').length)
            .reduce((a, b) => a + b, 0);
    }, [fundRequest?.records]);

    return (
        <StateNavLink
            className="fund-request-item"
            dataDusk={`fundRequestsItem${fundRequest.id}`}
            name={'fund-request-show'}
            params={{ id: fundRequest.id }}>
            <div className="fund-request-image">
                <img
                    src={
                        fundRequest?.fund?.logo?.sizes?.thumbnail ||
                        fundRequest?.fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                    }
                    alt="fund image"
                />
            </div>
            <div className="fund-request-container">
                <div className="fund-request-section">
                    <div className="fund-request-details">
                        <div className="fund-request-name">{fundRequest.fund.name}</div>
                        <div className="fund-request-subtitle">
                            ID <strong>{`#${fundRequest.id}`}</strong>
                        </div>
                    </div>
                    <div className="fund-request-overview">
                        {fundRequest.state === 'pending' && (
                            <div className="label label-warning">{fundRequest.state_locale}</div>
                        )}

                        {fundRequest.state === 'approved' && (
                            <div className="label label-success">{fundRequest.state_locale}</div>
                        )}

                        {fundRequest.state === 'declined' && (
                            <div className="label label-default">{fundRequest.state_locale}</div>
                        )}

                        {fundRequest.state === 'disregarded' && (
                            <div className="label label-danger">{fundRequest.state_locale}</div>
                        )}
                    </div>
                </div>
                <div className="fund-request-values">
                    <div className="fund-request-values-label">
                        {notAnsweredCount > 0 && (
                            <div className="label label-primary label-xl">
                                <div className="label-blink" aria-hidden="true" />
                                {notAnsweredCount} nieuw bericht
                            </div>
                        )}
                    </div>
                    <div className="fund-request-values-date">
                        <div className="fund-request-value-title">Ingediend op:</div>
                        <div className="fund-request-value">{fundRequest.created_at_locale}</div>
                    </div>
                </div>
            </div>
            <div className="fund-request-footer">
                <div className="fund-request-values-date">
                    <div className="fund-request-value-title">Ingediend op:</div>
                    <div className="fund-request-value">{fundRequest.created_at_locale}</div>
                </div>
                <div className="fund-request-values-label">
                    {notAnsweredCount > 0 && (
                        <div className="label label-primary label-xl">
                            <div className="label-blink" aria-hidden="true" />
                            {notAnsweredCount} nieuw bericht
                        </div>
                    )}
                </div>
            </div>
        </StateNavLink>
    );
}
