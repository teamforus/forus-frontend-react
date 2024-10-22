import React from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import PayoutCardOverview from './PayoutCardOverview';
import PayoutCardLabel from './PayoutCardLabel';
import PayoutCardDate from './PayoutCardDate';

export default function PayoutCard({ payout }: { payout: PayoutTransaction }) {
    const assetUrl = useAssetUrl();

    return (
        <div className="payout-item">
            <div className="payout-wrapper">
                <img
                    className="payout-photo"
                    src={
                        payout?.fund?.logo?.sizes?.thumbnail ||
                        payout?.fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/payout.svg')
                    }
                    alt=""
                />

                <div className="payout-details">
                    <PayoutCardLabel payout={payout} className={'show-sm'} />
                    <div className="payout-name">{payout.fund.name}</div>
                    <div className="payout-organization">{payout.fund.organization_name}</div>

                    <div className="payout-price">{payout.amount_locale}</div>
                    <PayoutCardDate payout={payout} className={'show-sm'} />
                    <PayoutCardOverview payout={payout} className={'hide-sm'} />
                </div>

                <div className="payout-info hide-sm">
                    <PayoutCardLabel payout={payout} />
                    <PayoutCardDate payout={payout} />
                </div>
            </div>

            <PayoutCardOverview payout={payout} className={'show-sm'} />
        </div>
    );
}
