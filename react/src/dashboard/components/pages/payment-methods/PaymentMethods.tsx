import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import useMollieConnectionService from '../../../services/MollieConnectionService';
import { ResponseError, ResponseErrorThrottled } from '../../../props/ApiResponses';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalDangerZone from '../../modals/ModalDangerZone';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import MollieConnection from '../../../props/models/MollieConnection';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { hasPermission } from '../../../helpers/utils';
import IconPayment from '../../../../../assets/forus-platform/resources/platform-general/assets/img/svg/mollie-payment-method-icon.svg';
import IconPaymentActive from '../../../../../assets/forus-platform/resources/platform-general/assets/img/svg/mollie-payment-method-icon-active.svg';
import IconConnectionPending from '../../../../../assets/forus-platform/resources/platform-general/assets/img/svg/mollie-connection-icon.svg';
import IconConnectionActive from '../../../../../assets/forus-platform/resources/platform-general/assets/img/svg/mollie-connection-icon-active.svg';
import MollieConnectionDetails from './elements/MollieConnectionDetails';
import MollieConnectionProfileDetails from './elements/MollieConnectionProfileDetails';
import MollieConnectionForm from './elements/MollieConnectionForm';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useTranslate from '../../../hooks/useTranslate';

export default function PaymentMethods() {
    const activeOrganization = useActiveOrganization();
    const mollieConnectionService = useMollieConnectionService();

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const [loaded, setLoaded] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [mollieConnection, setMollieConnection] = useState<MollieConnection>(null);
    const [fetchingMollieAccount, setFetchingMollieAccount] = useState(false);

    const onResponseError = useCallback(
        (err: ResponseError & ResponseErrorThrottled, fallbackMessage = 'Onbekende foutmelding!') => {
            return err.status === 429
                ? pushDanger(err.data.meta.title, err.data.meta.message)
                : pushDanger('Mislukt!', err.data?.message || fallbackMessage);
        },
        [pushDanger],
    );

    const connect = useCallback(() => {
        setProgress(0);

        mollieConnectionService
            .connect(activeOrganization.id)
            .then((res) => (document.location.href = res.data.url))
            .catch((err: ResponseError & ResponseErrorThrottled) => onResponseError(err))
            .finally(() => setProgress(100));
    }, [setProgress, mollieConnectionService, activeOrganization.id, onResponseError]);

    const fetchMollieAccount = useCallback(() => {
        if (fetchingMollieAccount) {
            return;
        }

        setProgress(0);
        setFetchingMollieAccount(true);

        mollieConnectionService
            .fetch(activeOrganization.id)
            .then((res) => setMollieConnection(res.data.data))
            .catch((err: ResponseError & ResponseErrorThrottled) => onResponseError(err))
            .finally(() => {
                setProgress(100);
                setFetchingMollieAccount(false);
            });
    }, [fetchingMollieAccount, setProgress, mollieConnectionService, activeOrganization.id, onResponseError]);

    const fetchMollieConnection = useCallback(() => {
        setProgress(0);

        mollieConnectionService
            .getActive(activeOrganization.id)
            .then((res) => setMollieConnection('id' in res.data.data ? res.data.data : null))
            .catch((err: ResponseError & ResponseErrorThrottled) => onResponseError(err))
            .finally(() => {
                setProgress(100);
                setLoaded(true);
            });
    }, [setProgress, mollieConnectionService, activeOrganization.id, onResponseError]);

    const deleteConnection = useCallback(
        function () {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_mollie_connection.title')}
                    description={translate('modals.danger_zone.remove_mollie_connection.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_mollie_connection.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            mollieConnectionService.delete(activeOrganization.id).then(() => {
                                pushSuccess('Gelukt!', 'Medewerker verwijderd.');
                                modal.close();
                                fetchMollieConnection();
                            }, onResponseError);
                        },
                        text: translate('modals.danger_zone.remove_mollie_connection.buttons.confirm'),
                    }}
                />
            ));
        },
        [
            openModal,
            translate,
            mollieConnectionService,
            activeOrganization.id,
            onResponseError,
            pushSuccess,
            fetchMollieConnection,
        ],
    );

    useEffect(() => {
        fetchMollieConnection();
    }, [fetchMollieConnection]);

    if (!loaded) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {!mollieConnection && !showForm && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-payment-connection form">
                            <div className="connection-content">
                                <div className="connection-content-icon">
                                    {privacy ? <IconPaymentActive /> : <IconPayment />}
                                </div>

                                <div className="connection-content-details">
                                    <div className="connection-content-title">Bijbetalen mogelijk maken via Mollie</div>
                                    <div className="connection-content-description">
                                        De koppeling met Mollie maakt het mogelijk om bijbetalingen van deelnemers te
                                        ontvangen. Hierdoor kunnen deelnemers het tegoed volledig besteden. De deelnemer
                                        betaalt een gedeelte van de kosten van het aanbod vanuit het resterende tegoed
                                        en een gedeelte zelf. Beide transacties worden naar u overgemaakt.
                                    </div>

                                    <CheckboxControl
                                        className={'checkbox-narrow'}
                                        checked={privacy}
                                        onChange={(e) => setPrivacy(e.target.checked)}>
                                        Ik heb de&nbsp;
                                        <StateNavLink
                                            name={'mollie-privacy'}
                                            params={{ organizationId: activeOrganization.id }}
                                            target="_blank">
                                            Algemene Voorwaarden
                                        </StateNavLink>
                                        &nbsp;gelezen en ga akkoord
                                    </CheckboxControl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="block block-payment-connection form">
                            <div className="connection-content">
                                <div className="button-group">
                                    <button
                                        className="button button-primary"
                                        onClick={() => setShowForm(true)}
                                        type="button"
                                        disabled={!privacy}>
                                        <em className="mdi mdi-store icon-start"></em>
                                        Een nieuw Mollie account aanmaken
                                    </button>

                                    <div className={(privacy ? '' : 'text-muted') + ' button-text-divider'}>or</div>
                                    <button
                                        className="button button-text"
                                        type="button"
                                        onClick={connect}
                                        disabled={!privacy}>
                                        Een bestaand Mollie account koppelen
                                        <em className="mdi mdi-open-in-new icon-end"></em>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!mollieConnection && showForm && (
                <MollieConnectionForm
                    organization={activeOrganization}
                    mollieConnection={mollieConnection}
                    onResponseError={onResponseError}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {mollieConnection && (
                <Fragment>
                    <div className="card">
                        <div className="card-section">
                            <div className="block block-payment-connection form">
                                <div className="connection-content">
                                    <div className="connection-content-icon">
                                        {mollieConnection.onboarding_state === 'completed' ? (
                                            <IconConnectionActive />
                                        ) : (
                                            <IconConnectionPending />
                                        )}
                                    </div>

                                    <div className="connection-content-details">
                                        <div className="connection-content-title">
                                            <span className="ng-scope">
                                                {translate('mollie_connection.header.title')}
                                            </span>
                                            <div className="flex flex-grow"></div>
                                            <label
                                                className={
                                                    (mollieConnection.onboarding_state == 'completed'
                                                        ? 'label-success'
                                                        : 'label-warning') + ' label'
                                                }>
                                                {mollieConnection.onboarding_state_locale}
                                            </label>
                                        </div>

                                        <div className="flex">
                                            <div className="flex flex-grow">
                                                <div className="block block-compact-datalist compact-datalist-vertical">
                                                    <div className="datalist-row">
                                                        <div className="datalist-key">
                                                            {translate('mollie_connection.labels.completed_at')}
                                                        </div>

                                                        {mollieConnection.completed_at ? (
                                                            <div className="datalist-value">
                                                                {mollieConnection.completed_at_locale}
                                                            </div>
                                                        ) : (
                                                            <div className="datalist-value text-muted">
                                                                {translate(
                                                                    'mollie_connection.header.unknown_competed_at',
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-vertical flex-end">
                                                <div className="button-group">
                                                    <button
                                                        className="button button-default button-sm"
                                                        disabled={fetchingMollieAccount}
                                                        onClick={fetchMollieAccount}>
                                                        <em className="mdi mdi-autorenew icon-start"></em>
                                                        {translate('mollie_connection.buttons.fetch')}
                                                    </button>

                                                    {hasPermission(activeOrganization, ['manage_payment_methods']) && (
                                                        <button
                                                            className="button button-danger button-sm"
                                                            disabled={fetchingMollieAccount}
                                                            onClick={deleteConnection}>
                                                            <em className="mdi mdi-close icon-start"></em>
                                                            {translate('mollie_connection.buttons.delete')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer card-footer-warning card-footer-sm">
                            <div className="card-title">
                                <div className="text-small">{translate('mollie_connection.header.warning')}</div>
                            </div>
                        </div>
                    </div>

                    <MollieConnectionDetails mollieConnection={mollieConnection} />

                    <MollieConnectionProfileDetails
                        organization={activeOrganization}
                        onResponseError={onResponseError}
                        mollieConnection={mollieConnection}
                        onChange={(connection) => setMollieConnection(connection)}
                    />
                </Fragment>
            )}
        </Fragment>
    );
}
