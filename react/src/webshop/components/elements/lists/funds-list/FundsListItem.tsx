import React, { useCallback } from 'react';
import FundsListItemList from './templates/FundsListItemList';
import FundsListItemSearch from './templates/FundsListItemSearch';
import Fund from '../../../../props/models/Fund';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import { useFundService } from '../../../../services/FundService';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useShowTakenByPartnerModal from '../../../../services/helpers/useShowTakenByPartnerModal';
import FundsListItemModel from '../../../../services/types/FundsListItemModel';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useFundMeta from '../../../../hooks/meta/useFundMeta';

export default function FundsListItem({
    fund,
    funds,
    vouchers,
    display,
    searchParams = null,
}: {
    display: 'list' | 'search';
    fund: Fund;
    vouchers: Array<Voucher>;
    funds?: Array<Fund>;
    searchParams?: object;
}) {
    const [applyingFund, setApplyingFund] = React.useState(false);
    const appConfigs = useAppConfigs();

    const fundService = useFundService();
    const navigateState = useNavigateState();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    const fundMeta = useFundMeta(fund, vouchers, appConfigs);

    const onApplySuccess = useCallback(
        (vouchers: Voucher) => {
            pushSuccess('Tegoed geactiveerd.');

            if (funds?.length === 1) {
                return navigateState('voucher', { number: vouchers.number });
            } else {
                document.location.reload();
            }
        },
        [funds?.length, navigateState, pushSuccess],
    );

    const applyFund = useCallback(
        function (e: React.MouseEvent, fund: FundsListItemModel) {
            e.stopPropagation();
            e.preventDefault();

            if (applyingFund) {
                return;
            }

            if (fund.taken_by_partner) {
                return showTakenByPartnerModal();
            }

            setApplyingFund(true);

            fundService
                .apply(fund.id)
                .then(
                    (res) => onApplySuccess(res.data.data),
                    (res) => pushDanger(res.data.message),
                )
                .finally(() => setApplyingFund(false));
        },
        [applyingFund, fundService, onApplySuccess, pushDanger, showTakenByPartnerModal],
    );

    if (!fundMeta) {
        return null;
    }

    if (display === 'search') {
        return (
            <StateNavLink
                name={'fund'}
                params={{ id: fund.id }}
                state={{ searchParams: searchParams || null }}
                className={'search-item search-item-fund'}
                dataDusk="productItem">
                <FundsListItemSearch fund={fundMeta} applyFund={applyFund} />
            </StateNavLink>
        );
    }

    return (
        <StateNavLink name={'fund'} params={{ id: fund.id }} state={{ searchParams: searchParams || null }}>
            <div className={'fund-item'}>
                <FundsListItemList fund={fundMeta} applyFund={applyFund} />
            </div>
        </StateNavLink>
    );
}
