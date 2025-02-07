import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import Reimbursement from '../../../props/models/Reimbursement';
import { useReimbursementService } from '../../../services/ReimbursementService';
import { useParams } from 'react-router-dom';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { useNavigateState } from '../../../modules/state_router/Router';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import useConfirmReimbursementDestroy from '../../../services/helpers/useConfirmReimbursementDestroy';
import ReimbursementDetailsCard from '../reimbursements/elements/ReimbursementDetailsCard';
import useSetTitle from '../../../hooks/useSetTitle';

export default function ReimbursementsShow() {
    const { id } = useParams();

    const translate = useTranslate();
    const setTitle = useSetTitle();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const confirmReimbursementDestroy = useConfirmReimbursementDestroy();

    const reimbursementService = useReimbursementService();

    const [reimbursement, setReimbursement] = useState<Reimbursement>(null);

    const fetchReimbursement = useCallback(() => {
        if (!id) {
            return;
        }

        setProgress(0);

        reimbursementService
            .read(parseInt(id))
            .then((res) => setReimbursement(res.data.data))
            .finally(() => setProgress(100));
    }, [id, setProgress, reimbursementService]);

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
                            navigateState('reimbursements');
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
            translate,
        ],
    );

    useEffect(() => {
        fetchReimbursement();
    }, [fetchReimbursement]);

    useEffect(() => {
        if (reimbursement?.code) {
            setTitle(translate('page_state_titles.reimbursement', { code: `#${reimbursement?.code || ''}` }));
        }
    }, [setTitle, reimbursement, translate]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('reimbursements.breadcrumbs.home'), state: 'home' },
                { name: translate('reimbursements.breadcrumbs.reimbursements'), state: 'reimbursements' },
                { name: translate('reimbursements.breadcrumbs.reimbursement') },
            ]}
            contentDusk={'reimbursementDetailsPage'}
            profileHeader={
                reimbursement && (
                    <div className="profile-content-header">
                        <div className="flex">
                            <div className="flex flex-grow flex-center">
                                <h1 className="profile-content-title flex flex-center flex-vertical">
                                    {translate('reimbursements.details.code', { code: reimbursement.code })}
                                </h1>
                            </div>
                            <div className="flex flex-center hide-sm">
                                {reimbursement.state === 'draft' && (
                                    <div
                                        className="button button-dark button-sm pull-right"
                                        data-dusk="reimbursementDetailsPageDeleteBtn"
                                        onClick={(e) => cancelReimbursement(e)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        {translate('reimbursements.details.buttons.cancel')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }>
            {reimbursement && (
                <Fragment>
                    <div className="card">
                        <div className="card-section">
                            <ReimbursementDetailsCard reimbursement={reimbursement} />
                        </div>
                        <div className="card-section card-section-sm show-sm">
                            <div className="flex flex-center">
                                {reimbursement.state === 'draft' && (
                                    <div
                                        className="button button-dark button-sm pull-right"
                                        data-dusk="reimbursementDetailsPageDeleteBtn"
                                        onClick={(e) => cancelReimbursement(e)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        {translate('reimbursements.details.buttons.cancel')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
