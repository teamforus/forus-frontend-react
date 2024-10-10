import React, { useState } from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import PayoutCardDetails from './PayoutCardDetails';
import PayoutCardDetailsShowMore from './PayoutCardDetailsShowMore';

export default function PayoutCard({ payoutTransaction }: { payoutTransaction: PayoutTransaction }) {
    const assetUrl = useAssetUrl();

    const [showMore, setShowMore] = useState(false);

    if (!payoutTransaction) {
        return null;
    }

    return (
        <div className="payout-item">
            <div className="payout-photo">
                <img
                    src={
                        payoutTransaction?.fund?.logo?.sizes?.thumbnail ||
                        payoutTransaction?.fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/payout.svg')
                    }
                    alt=""
                />
            </div>

            <div className="payout-content">
                <div className="payout-content-main">
                    <div className="payout-details">
                        <div className="payout-name">{payoutTransaction.fund.name}</div>
                        <div className="payout-organization-name">{payoutTransaction.fund.organization_name}</div>
                        <div className="payout-price">{payoutTransaction.amount_locale}</div>

                        <div className="hide-sm">
                            <PayoutCardDetailsShowMore showMore={showMore} setShowMore={setShowMore} />
                        </div>

                        <div className="payout-status-label">
                            {payoutTransaction.state === 'pending' && (
                                <div className="label label-warning">{payoutTransaction.state_locale}</div>
                            )}

                            {payoutTransaction.state === 'success' && (
                                <div className="label label-success">{payoutTransaction.state_locale}</div>
                            )}

                            {payoutTransaction.state === 'canceled' && (
                                <div className="label label-default">{payoutTransaction.state_locale}</div>
                            )}
                        </div>

                        {payoutTransaction.transfer_at_locale && (
                            <div className="payout-date">
                                <div className="payout-date-label">Uitbetaald op</div>
                                <div className="payout-date-value">{payoutTransaction.transfer_at_locale}</div>
                            </div>
                        )}
                    </div>

                    <div className="payout-card-details-wrapper">
                        {showMore && <PayoutCardDetails payoutTransaction={payoutTransaction} />}
                    </div>
                </div>
            </div>

            <div className="payout-card-details-wrapper">
                <div className="payout-read-more-wrapper">
                    <PayoutCardDetailsShowMore showMore={showMore} setShowMore={setShowMore} />
                </div>
                {showMore && <PayoutCardDetails payoutTransaction={payoutTransaction} />}
            </div>
        </div>
    );
}
