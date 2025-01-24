import React, { Fragment, useCallback } from 'react';
import { useNavigateState } from '../../../../../modules/state_router/Router';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

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

    const finish = useCallback(() => {
        navigateState('funds');
    }, [navigateState]);

    return (
        <Fragment>
            {progress}

            {finishError ? (
                <div className="sign_up-pane">
                    <h1 className="sr-only">Aanmelden</h1>
                    <h2 className="sign_up-pane-header">Er is een fout opgetreden tijdens het aanvragen.</h2>
                    <div className="sign_up-pane-body">
                        <div className="row">
                            <div className="form-group col col-lg-12">
                                <div className="block-icon">
                                    <div className="mdi mdi-close" />
                                </div>
                                <p className="sign_up-pane-text text-center">Reden:</p>
                                <p className="sign_up-pane-text text-center">{errorReason}</p>
                                <div className="text-center">
                                    <div className="button button-dark" onClick={finish} role="button">
                                        Verlaat formulier
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
                <div className="sign_up-pane" data-dusk="fundRequestSuccess">
                    <h2 className="sign_up-pane-header">Aanvraag ontvangen</h2>
                    <div className="sign_up-pane-body">
                        <div className="row">
                            <h2 className="sign_up-pane-heading text-center">Verzonden!</h2>
                            <p className="sign_up-pane-text text-center">
                                Je aanvraag is ontvangen. De aanvraag wordt binnen 10 werkdagen verwerkt. Je ontvangt
                                hierover een e-mail.
                            </p>
                            <div className="block-icon">
                                <img src={assetUrl('/assets/img/icon-sign_up-success.svg')} alt="" />
                            </div>
                            <div className="text-center">
                                <button className="button button-primary" onClick={finish} role="button">
                                    Terug
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
