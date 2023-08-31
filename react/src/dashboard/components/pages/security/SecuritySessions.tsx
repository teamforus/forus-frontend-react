import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { useSessionService } from '../../../services/SessionService';
import useFilters from '../../../hooks/useFilters';
import { PaginationData } from '../../../props/ApiResponses';
import Session from '../../../props/models/Session';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import ModalNotification from '../../modals/ModalNotification';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { authContext } from '../../../contexts/AuthContext';
import { mainContext } from '../../../contexts/MainContext';
import useSetProgress from '../../../hooks/useSetProgress';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';

export default function SecuritySessions() {
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigate = useNavigate();

    const { signOut } = useContext(authContext);
    const { clearAll } = useContext(mainContext);

    const filters = useFilters({ per_page: 100 });
    const sessionService = useSessionService();
    const [sessions, setSessions] = useState<PaginationData<Session>>(null);
    const [shownLocations, setShownLocations] = useState({});

    const [titles] = useState({
        general: 'Onbekend',
        sponsor: 'Sponsor beheeromgeving',
        provider: 'Aanbieders beheeromgeving',
        validator: 'Beoordelaar beheeromgevingg',
        webshop: 'Webshop',
        'app-me_ap': 'Me-app',
        'app-me_ap-android': 'Me-app',
        'app-me_ap-ios': 'Me-app',
        'me_app-androd': 'Me-app',
        'me_app-is': 'Me-app ',
    });

    const fetchSessions = useCallback(() => {
        setProgress(0);

        sessionService
            .list(filters?.activeValues)
            .then((res) => setSessions(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, sessionService, filters?.activeValues]);

    const findIcon = useCallback((session: Session) => {
        const device = session.last_request.device?.device;

        const types = {
            desktop: 'monitor',
            mobile: 'cellphone',
            tablet: 'tablet',
        };

        if (!session.last_request.device_available) {
            return 'shield-outline';
        }

        return types[device?.type] || 'help-rhombus';
    }, []);

    const terminateSession = useCallback(
        (session) => {
            const onDone = (modal: ModalState) => {
                modal.close();
                setProgress(0);

                sessionService
                    .terminate(session.uid)
                    .then(
                        () => {
                            fetchSessions();
                            pushSuccess('Terminated!');
                        },
                        (e) => pushDanger('Error!', e.data?.message),
                    )
                    .finally(() => setProgress(100));
            };

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={'Beëindig sessie'}
                    description={'De sessie beëindigen kan er voor zorgen dat u uitgelogd raakt, wilt u doorgaan?'}
                    className={'modal-md'}
                    buttonCancel={{ onClick: () => modal.close() }}
                    buttonSubmit={{ onClick: () => onDone(modal) }}
                />
            ));
        },
        [fetchSessions, sessionService, openModal, pushDanger, pushSuccess, setProgress],
    );

    const terminateAllSessions = useCallback(() => {
        const onDone = (modal: ModalState) => {
            modal.close();
            setProgress(0);

            sessionService
                .terminateAll()
                .then(
                    () => {
                        signOut();
                        clearAll();
                        navigate(getStateRouteUrl('home'));
                        pushSuccess('Terminated!');
                    },
                    (e) => pushDanger('Error!', e.data?.message),
                )
                .finally(() => setProgress(100));
        };

        openModal((modal) => (
            <ModalNotification
                modal={modal}
                title={'Beëindig alle sessies'}
                description={'U wordt nu uitgelogd op alle apparaten, wilt u doorgaan?'}
                className={'modal-md'}
                buttonCancel={{ onClick: () => modal.close() }}
                buttonSubmit={{ onClick: () => onDone(modal) }}
            />
        ));
    }, [clearAll, navigate, openModal, pushDanger, pushSuccess, sessionService, setProgress, signOut]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    if (!sessions) {
        return <LoadingCard />;
    }

    return (
        <div className={'card'}>
            <div className="card-header">
                <div className="card-title">Huidige sessies</div>
            </div>
            <div className="card-section card-section-padless">
                <div className="block block-sessions">
                    {sessions.data.map((session) => (
                        <div key={session.uid} className="session-item">
                            <div className="session-icon">
                                <div className={`mdi mdi-${findIcon(session)}`} />
                            </div>
                            <div className="session-details">
                                <div className="session-title">
                                    {titles[session.client_type]}
                                    <span className="text-primary"> • </span>
                                    {session.last_request.device_string}
                                </div>
                                <div className="session-properties">
                                    <div className="session-property">
                                        <div className="session-property-label">Laatste activiteit</div>
                                        <div className="session-property-value">
                                            {session.last_request.time_passed_locale}
                                            {session.last_request.location && (
                                                <span className="session-property-sep text-primary">•</span>
                                            )}
                                            {session.last_request.location && (
                                                <Fragment>
                                                    {`${session.last_request.location.ip} • ${session.last_request.location.string}`}
                                                </Fragment>
                                            )}
                                        </div>
                                    </div>
                                    <div className="session-property">
                                        <div className="session-property-label">Sessie gestart:</div>
                                        <div className="session-property-value">{session.started_at_locale}</div>
                                    </div>
                                </div>

                                <div className="session-actions flex">
                                    {session.locations.length > 1 && (
                                        <a
                                            className="session-action"
                                            onClick={() =>
                                                setShownLocations({
                                                    ...shownLocations,
                                                    [session.uid]: !shownLocations[session.uid],
                                                })
                                            }>
                                            Bekijk alle locaties
                                            {shownLocations[session.uid] && <em className="mdi mdi-menu-up" />}
                                            {!shownLocations[session.uid] && <em className="mdi mdi-menu-right" />}
                                        </a>
                                    )}

                                    <a onClick={() => terminateSession(session)} className="session-action">
                                        Beëindig sessie
                                        <em className="mdi mdi-close" />
                                    </a>
                                </div>

                                {session.locations.length > 1 && shownLocations[session.uid] && (
                                    <div className="session-locations">
                                        {session.locations.map((location, index) => (
                                            <div key={index} className="session-location">
                                                {`${location.ip} • ${location.string}`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {session.current && (
                                <div className="session-label">
                                    <div className="label label-round label-primary-light">Huidig</div>
                                </div>
                            )}

                            {session.active && !session.current && (
                                <div className="session-label">
                                    <div className="label label-round label-success">Online</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card-section text-right">
                <button type={'button'} className="button button-primary" onClick={() => terminateAllSessions()}>
                    Beëindig alle sessies
                    <em className="mdi mdi-close icon-end" />
                </button>
            </div>
        </div>
    );
}
