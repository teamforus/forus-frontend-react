import React, { useCallback } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Reimbursement from '../../../../props/models/Reimbursement';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import usePushDanger from '../../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../../dashboard/hooks/usePushSuccess';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useConfirmReimbursementDestroy from '../../../../services/helpers/useConfirmReimbursementDestroy';
import { useReimbursementService } from '../../../../services/ReimbursementService';
import IconReimbursement from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-reimbursement.svg';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import classNames from 'classnames';

export default function ReimbursementCard({
    onDelete,
    reimbursement,
}: {
    onDelete: () => void;
    reimbursement: Reimbursement;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const confirmReimbursementDestroy = useConfirmReimbursementDestroy();

    const reimbursementService = useReimbursementService();

    const cancelReimbursement = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            setProgress(0);

            confirmReimbursementDestroy().then((confirmed) => {
                if (confirmed) {
                    reimbursementService
                        .destroy(reimbursement.id)
                        .then(() => {
                            pushSuccess(translate('push.success'), translate('push.reimbursement.canceled'));
                            navigateState(WebshopRoutes.REIMBURSEMENTS);
                            onDelete();
                        })
                        .catch((err: ResponseError) => pushDanger(translate('push.error'), err.data.message))
                        .finally(() => setProgress(100));
                }
            });
        },
        [
            confirmReimbursementDestroy,
            navigateState,
            pushDanger,
            pushSuccess,
            reimbursement,
            reimbursementService,
            setProgress,
            onDelete,
            translate,
        ],
    );

    return (
        <StateNavLink
            name={WebshopRoutes.REIMBURSEMENT}
            params={{ id: reimbursement.id }}
            className="reimbursement-item"
            dataDusk={`listReimbursementsRow${reimbursement.id}`}
            dataAttributes={{ 'data-search-item': 1 }}>
            <div
                className={classNames(
                    'reimbursement-image',
                    reimbursement.state === 'draft' && 'reimbursement-image-draft',
                    reimbursement.state === 'pending' && 'reimbursement-image-pending',
                    reimbursement.state === 'approved' && 'reimbursement-image-approved',
                    reimbursement.state === 'declined' && 'reimbursement-image-declined',
                )}
                role="img"
                aria-hidden={!reimbursement?.files?.[0]?.preview}>
                {!reimbursement?.files?.[0]?.preview ? (
                    <IconReimbursement />
                ) : (
                    <img src={reimbursement?.files?.[0]?.preview?.sizes?.thumbnail} alt="reimbursement image" />
                )}
            </div>

            <div className="reimbursement-container">
                <div className="reimbursement-section">
                    <div className="reimbursement-details">
                        <StateNavLink
                            customElement={'h2'}
                            name={WebshopRoutes.REIMBURSEMENT}
                            params={{ id: reimbursement.id }}
                            className="reimbursement-name"
                            dataDusk="reimbursementsItemTitle">
                            {reimbursement.title}
                        </StateNavLink>
                        <StateNavLink
                            customElement={'div'}
                            name={WebshopRoutes.REIMBURSEMENT}
                            params={{ id: reimbursement.id }}
                            className="reimbursement-organization"
                            dataDusk="reimbursementsItemFundName">
                            {reimbursement.fund?.name}
                        </StateNavLink>
                        <div className="reimbursement-value" data-dusk="reimbursementsItemAmount">
                            {reimbursement.amount_locale}
                        </div>
                    </div>

                    {!reimbursement.expired && reimbursement.state === 'draft' && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelDraft">
                            <div className="reimbursement-overview-status">
                                <div className="label label-default label-round">{reimbursement?.state_locale}</div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">
                                    {translate('reimbursements.item.number')}
                                </div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                        </div>
                    )}

                    {!reimbursement.expired && reimbursement.state === 'pending' && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelPending">
                            <div className="reimbursement-overview-status">
                                <div className="label label-warning label-round">
                                    {translate('reimbursements.item.states.pending')}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">
                                    {translate('reimbursements.item.number')}
                                </div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                        </div>
                    )}

                    {!reimbursement.expired && reimbursement.state === 'approved' && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelApproved">
                            <div className="reimbursement-overview-status">
                                <div className="label label-success label-round">
                                    {translate('reimbursements.item.states.accepted')}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">
                                    {translate('reimbursements.item.number')}
                                </div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                        </div>
                    )}

                    {!reimbursement.expired && reimbursement.state === 'declined' && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelDeclined">
                            <div className="reimbursement-overview-status">
                                <div className="label label-default label-round">
                                    {translate('reimbursements.item.states.declined')}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">
                                    {translate('reimbursements.item.number')}
                                </div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">
                                    {translate('reimbursements.item.states.declined_at')}
                                </div>
                                <div className="reimbursement-overview-value">{reimbursement.rejected_at_locale}</div>
                            </div>
                        </div>
                    )}

                    {reimbursement.expired && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelExpired">
                            <div className="reimbursement-overview-status">
                                <div className="label label-danger label-round">
                                    {translate('reimbursements.item.states.expired')}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">
                                    {translate('reimbursements.item.number')}
                                </div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">
                                    {translate('reimbursements.item.states.expired_at')}
                                </div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemDateExpired">
                                    {reimbursement.expire_at_locale}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="reimbursement-values">
                    {reimbursement.submitted_at && (
                        <div className="reimbursement-value">
                            {translate('reimbursements.item.labels.submitted_at')}{' '}
                            <strong data-dusk="reimbursementsItemDateSubmitted">
                                {reimbursement.submitted_at_locale}
                            </strong>
                        </div>
                    )}

                    {reimbursement.state === 'approved' &&
                        reimbursement.resolved_at &&
                        reimbursement.voucher_transaction?.state == 'success' && (
                            <div className="reimbursement-value" data-dusk="reimbursementsItemDateResolved">
                                {translate('reimbursements.item.labels.approved_at')}{' '}
                                <strong>{reimbursement.voucher_transaction?.created_at_locale}</strong>
                            </div>
                        )}

                    {reimbursement.state === 'approved' &&
                        reimbursement.resolved_at &&
                        reimbursement.voucher_transaction.state != 'success' && (
                            <div className="reimbursement-value" data-dusk="reimbursementsItemDateResolved">
                                {translate('reimbursements.item.labels.accepted_at')}{' '}
                                <strong>{reimbursement.resolved_at_locale}</strong>
                            </div>
                        )}

                    {reimbursement.state === 'declined' && reimbursement.resolved_at && (
                        <div className="reimbursement-value" data-dusk="reimbursementsItemDateDeclined">
                            {translate('reimbursements.item.labels.declined_at')}{' '}
                            <strong>{reimbursement.resolved_at_locale}</strong>
                        </div>
                    )}

                    {!reimbursement.expired && reimbursement.state === 'draft' && (
                        <div className="reimbursement-value">
                            <button
                                className="button button-light button-xs"
                                data-dusk="reimbursementsItemBtnCancel"
                                onClick={(e) => cancelReimbursement(e)}>
                                <em className="mdi mdi-trash-can-outline" />
                                {translate('reimbursements.item.buttons.cancel')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </StateNavLink>
    );
}
