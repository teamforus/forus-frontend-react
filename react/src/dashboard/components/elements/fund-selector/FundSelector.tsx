import React, { useCallback, useEffect, useState } from 'react';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';

export default function FundSelector({
    fund,
    funds,
    onFundSelect,
}: {
    fund: Fund;
    funds: Array<Fund>;
    onFundSelect: (fund: Fund) => void;
}) {
    const assetUrl = useAssetUrl();

    const fundService = useFundService();

    const [activeFund, setActiveFund] = useState<Fund>(null);

    const selectFund = useCallback(
        (fund: Fund) => {
            fundService.setLastSelectedFund(fund);
            setActiveFund(fund);

            if (fund) {
                onFundSelect ? onFundSelect(fund) : null;
            }
        },
        [fundService, onFundSelect],
    );

    useEffect(() => {
        const lastSelectedFund = fundService.getLastSelectedFund(funds);

        if (fund && fund?.id !== lastSelectedFund?.id) {
            return selectFund(fund);
        }

        setActiveFund(fund);
    }, [fund, fundService, funds, selectFund]);

    return (
        <div className="block block-choose-organization">
            {funds?.map((fund: Fund) => (
                <div key={fund.id} className="organization-item" onClick={() => selectFund(fund)}>
                    <div className={'organization-item-inner ' + (activeFund?.id == fund.id ? 'active' : '')}>
                        <div className="organization-logo">
                            <img
                                src={
                                    fund.logo?.sizes.thumbnail ||
                                    assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                                }
                                alt={fund.name}
                            />
                        </div>
                        <div className="organization-name">{fund.name}</div>
                    </div>
                </div>
            ))}
            <br />
        </div>
    );
}
