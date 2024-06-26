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

export default function ReimbursementCard({
    onDelete,
    reimbursement,
}: {
    onDelete: () => void;
    reimbursement: Reimbursement;
}) {
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
                            pushSuccess('Declaratie geannuleerd.');
                            navigateState('reimbursements');
                            onDelete();
                        })
                        .catch((err: ResponseError) => pushDanger('Error.', err.data.message))
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
        ],
    );

    return (
        <StateNavLink
            name={'reimbursement'}
            params={{ id: reimbursement.id }}
            className="reimbursement-item"
            dataDusk={`reimbursementsItem${reimbursement.id}`}>
            <div
                className={`reimbursement-image reimbursement-image-${reimbursement.state}`}
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
                            name={'reimbursement'}
                            params={{ id: reimbursement.id }}
                            className="reimbursement-name"
                            dataDusk="reimbursementsItemTitle">
                            {reimbursement.title}
                        </StateNavLink>
                        <StateNavLink
                            customElement={'div'}
                            name={'reimbursement'}
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
                                <div className="reimbursement-overview-label">Declaratienummer:</div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                        </div>
                    )}

                    {!reimbursement.expired && reimbursement.state === 'pending' && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelPending">
                            <div className="reimbursement-overview-status">
                                <div className="label label-warning label-round">In afwachting</div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">Declaratienummer:</div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                        </div>
                    )}

                    {!reimbursement.expired && reimbursement.state === 'approved' && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelApproved">
                            <div className="reimbursement-overview-status">
                                <div className="label label-success label-round">Geaccepteerd</div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">Declaratienummer:</div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                        </div>
                    )}

                    {!reimbursement.expired && reimbursement.state === 'declined' && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelDeclined">
                            <div className="reimbursement-overview-status">
                                <div className="label label-default label-round">Geweigerd</div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">Declaratienummer:</div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">Geweigerd op:</div>
                                <div className="reimbursement-overview-value">{reimbursement.rejected_at_locale}</div>
                            </div>
                        </div>
                    )}
                    {reimbursement.expired && (
                        <div className="reimbursement-overview" data-dusk="reimbursementsItemLabelExpired">
                            <div className="reimbursement-overview-status">
                                <div className="label label-danger label-round">Verlopen</div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">Declaratienummer:</div>
                                <div className="reimbursement-overview-value" data-dusk="reimbursementsItemCode">
                                    #{reimbursement.code}
                                </div>
                            </div>
                            <div className="reimbursement-overview-item">
                                <div className="reimbursement-overview-label">Verlopen op:</div>
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
                            Ingediend op:{' '}
                            <strong data-dusk="reimbursementsItemDateSubmitted">
                                {reimbursement.submitted_at_locale}
                            </strong>
                        </div>
                    )}
                    {reimbursement.state === 'approved' &&
                        reimbursement.resolved_at &&
                        reimbursement.voucher_transaction?.state == 'success' && (
                            <div className="reimbursement-value" data-dusk="reimbursementsItemDateResolved">
                                Uitbetaald op: <strong>{reimbursement.voucher_transaction?.created_at_locale}</strong>
                            </div>
                        )}

                    {reimbursement.state === 'approved' &&
                        reimbursement.resolved_at &&
                        reimbursement.voucher_transaction.state != 'success' && (
                            <div className="reimbursement-value" data-dusk="reimbursementsItemDateResolved">
                                Geaccepteerd op: <strong>{reimbursement.resolved_at_locale}</strong>
                            </div>
                        )}

                    {reimbursement.state === 'declined' && reimbursement.resolved_at && (
                        <div className="reimbursement-value" data-dusk="reimbursementsItemDateDeclined">
                            Afgewezen op:
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
                                Annuleren
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </StateNavLink>
    );
}
