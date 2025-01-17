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
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';

export default function FundsListItem({
    fund,
    funds,
    display,
    payouts,
    vouchers,
    stateParams = null,
}: {
    fund: Fund;
    funds?: Array<Fund>;
    display: 'list' | 'search';
    payouts: Array<PayoutTransaction>;
    vouchers: Array<Voucher>;
    stateParams?: object;
}) {
    const [applyingFund, setApplyingFund] = React.useState(false);
    const appConfigs = useAppConfigs();

    const fundService = useFundService();
    const navigateState = useNavigateState();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const showTakenByPartnerModal = useShowTakenByPartnerModal();

    const fundMeta = useFundMeta(fund, payouts, vouchers, appConfigs);

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
                state={stateParams || null}
                className={'search-item search-item-fund'}
                dataDusk={`fundItem${fund.id}`}>
                <FundsListItemSearch fund={fundMeta} applyFund={applyFund} />
            </StateNavLink>
        );
    }

    return (
        <StateNavLink
            name={'fund'}
            params={{ id: fund.id }}
            state={stateParams || null}
            className={'fund-item'}
            dataDusk={`fundItem${fund.id}`}>
            <FundsListItemList fund={fundMeta} applyFund={applyFund} />
        </StateNavLink>
    );
}
