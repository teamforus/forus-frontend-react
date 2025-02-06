import React, { Fragment, useCallback } from 'react';
import { useNavigateState } from '../../../../../modules/state_router/Router';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';

export default function FundRequestStepDone({
    finishError,
    errorReason,
    progress,
}: {
    finishError: boolean;
    errorReason: string;
    progress: React.ReactElement;
}) {
    const assetUrl = useAssetUrl();
    const navigateState = useNavigateState();
    const translate = useTranslate();

    const finish = useCallback(() => {
        navigateState('funds');
    }, [navigateState]);

    return (
        <Fragment>
            {progress}

            {finishError ? (
                <div className="sign_up-pane">
                    <h1 className="sr-only">{translate('fund_request.sign_up.fund_request_step_done.sign_up')}</h1>
                    <h2 className="sign_up-pane-header">
                        {translate('fund_request.sign_up.fund_request_step_done.error_occurred')}
                    </h2>
                    <div className="sign_up-pane-body">
                        <div className="row">
                            <div className="form-group col col-lg-12">
                                <div className="block-icon">
                                    <div className="mdi mdi-close" />
                                </div>
                                <p className="sign_up-pane-text text-center">
                                    {translate('fund_request.sign_up.fund_request_step_done.reason')}
                                </p>
                                <p className="sign_up-pane-text text-center">{errorReason}</p>
                                <div className="text-center">
                                    <div className="button button-dark" onClick={finish} role="button">
                                        {translate('fund_request.sign_up.fund_request_step_done.leave_form')}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group col col-lg-12">
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="sign_up-pane">
                    <h2 className="sign_up-pane-header">
                        {translate('fund_request.sign_up.fund_request_step_done.application_received')}
                    </h2>
                    <div className="sign_up-pane-body">
                        <div className="row">
                            <h2 className="sign_up-pane-heading text-center">
                                {translate('fund_request.sign_up.fund_request_step_done.sent')}
                            </h2>
                            <p className="sign_up-pane-text text-center">
                                {translate('fund_request.sign_up.fund_request_step_done.application_processing')}
                            </p>
                            <div className="block-icon">
                                <img src={assetUrl('/assets/img/icon-sign_up-success.svg')} alt="" />
                            </div>
                            <div className="text-center">
                                <button className="button button-primary" onClick={finish} role="button">
                                    {translate('fund_request.sign_up.fund_request_step_done.back')}
                                </button>
                            </div>
                            <div className="form-group col col-lg-12 hidden-xs">
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
