import React, { useCallback, useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { useNavigateState } from '../../../modules/state_router/Router';
import { StringParam, useQueryParams } from 'use-query-params';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { useAuthService } from '../../../services/AuthService';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalIdentityProxyExpired from '../../modals/ModalIdentityProxyExpired';

const targetVoucher = 'voucher';
const targetFundRequest = 'fundRequest';
const targetProductReservation = 'productReservation';
const targetRequestClarification = 'requestClarification';

export default function IdentityRestore({ confirmation = false }: { confirmation: boolean }) {
    const tokenParam = useParams().token;
    const [query] = useQueryParams({
        token: StringParam,
        target: StringParam,
    });

    const { setToken } = useContext(authContext);

    const openModal = useOpenModal();
    const target = query.target;
    const token = confirmation ? tokenParam : query.token;
    const identityService = useIdentityService();
    const navigateState = useNavigateState();
    const { onAuthRedirect } = useAuthService();

    const handleAuthTarget = useCallback(
        (target: Array<string>) => {
            if (target[0] == targetFundRequest) {
                if (target?.[1]) {
                    navigateState('fund-request-show', { id: target[1] });
                } else {
                    navigateState('start');
                }

                return true;
            }

            if (target[0] == targetVoucher) {
                if (target?.[1]) {
                    navigateState('voucher', { address: target[1] });
                } else {
                    navigateState('start');
                }
                return true;
            }

            if (target[0] == targetRequestClarification) {
                if (target?.[1] && target?.[2] && target?.[3]) {
                    navigateState('fund-request-clarification', {
                        fund_id: target[1],
                        request_id: target[2],
                        clarification_id: target[3],
                    });
                } else {
                    navigateState('start');
                }

                return true;
            }

            if (target[0] == targetProductReservation) {
                if (target?.[1]) {
                    navigateState('product', { id: target[1] });
                } else {
                    navigateState('start');
                }

                return true;
            }

            return false;
        },
        [navigateState],
    );

    const exchangeToken = useCallback(
        (token: string, target: string) => {
            const promise = confirmation
                ? identityService.exchangeConfirmationToken(token)
                : identityService.authorizeAuthEmailToken(token);

            promise
                .then((res) => {
                    setToken(res.data.access_token);

                    if (typeof target != 'string' || !handleAuthTarget(target.split('-'))) {
                        onAuthRedirect().then();
                    }
                })
                .catch(() => {
                    navigateState('home');
                    openModal((modal) => <ModalIdentityProxyExpired modal={modal} />);
                });
        },
        [confirmation, identityService, setToken, handleAuthTarget, onAuthRedirect, navigateState, openModal],
    );

    useEffect(() => {
        exchangeToken(token, target);
    }, [exchangeToken, token, target]);

    return <></>;
}
