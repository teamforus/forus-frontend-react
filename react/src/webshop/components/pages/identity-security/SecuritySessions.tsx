import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useNavigateState } from '../../../modules/state_router/Router';
import { authContext } from '../../../contexts/AuthContext';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import SessionModel from '../../../../dashboard/props/models/Session';
import { useSessionService } from '../../../../dashboard/services/SessionService';
import useFilter from '../../../../dashboard/hooks/useFilter';
import { ModalState } from '../../../../dashboard/modules/modals/context/ModalContext';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import ModalNotification from '../../modals/ModalNotification';
import Auth2FARestriction from '../../../components/elements/auth2fa-restriction/Auth2FARestriction';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';

export default function SecuritySessions() {
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const auth2FAState = useAuthIdentity2FAState();
    const auth2faRestricted = useMemo(() => auth2FAState?.restrictions?.sessions?.restricted, [auth2FAState]);

    const { signOut } = useContext(authContext);

    const filter = useFilter({ per_page: 100 });
    const sessionService = useSessionService();
    const [sessions, setSessions] = useState<PaginationData<SessionModel>>(null);
    const [shownLocations, setShownLocations] = useState({});

    const [titles] = useState({
        general: 'Onbekend',
        sponsor: 'Sponsor beheeromgeving',
        provider: 'Aanbieders beheeromgeving',
        validator: 'Beoordelaar beheeromgeving',
        webshop: 'Webshop',
        'app-me_ap': 'Me-app',
        'app-me_ap-android': 'Me-app',
        'app-me_ap-ios': 'Me-app',
        'me_app-android': 'Me-app',
        'me_app-is': 'Me-app ',
    });

    const fetchSessions = useCallback(() => {
        setProgress(0);

        sessionService
            .list(filter?.activeValues)
            .then((res) => setSessions(res.data))
            .finally(() => setProgress(100));
    }, [setProgress, sessionService, filter?.activeValues]);

    const findIcon = useCallback((session: SessionModel) => {
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
        (session: SessionModel) => {
            const onDone = (modal: ModalState) => {
                modal.close();
                setProgress(0);

                sessionService
                    .terminate(session.uid)
                    .then(() => {
                        fetchSessions();
                        pushSuccess('Terminated!');
                    })
                    .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
                    .finally(() => setProgress(100));
            };

            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={'Einde sessie'}
                    header={'Beëindig sessie'}
                    mdiIconType={'primary'}
                    mdiIconClass={'information-outline'}
                    description={'De sessie beëindigen kan er voor zorgen dat u uitgelogd raakt, wilt u doorgaan?'}
                    onCancel={() => modal.close()}
                    onConfirm={() => onDone(modal)}
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
                .then(() => {
                    signOut();
                    navigateState('home');
                    pushSuccess('Terminated!');
                })
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
                .finally(() => setProgress(100));
        };

        openModal((modal) => (
            <ModalNotification
                modal={modal}
                type={'confirm'}
                title={'Beëindig alle sessies'}
                description={'U wordt nu uitgelogd op alle apparaten, wilt u doorgaan?'}
                onConfirm={() => onDone(modal)}
            />
        ));
    }, [navigateState, openModal, pushDanger, pushSuccess, sessionService, setProgress, signOut]);

    useEffect(() => {
        if (auth2faRestricted === false) {
            fetchSessions();
        }
    }, [fetchSessions, auth2faRestricted]);

    return (
        <BlockShowcaseProfile
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name="home" className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active">Beveiliging</div>
                </div>
            }
            profileHeader={
                (auth2faRestricted || sessions) &&
                (auth2faRestricted ? (
                    <></>
                ) : (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                {sessions && <div className="profile-content-title-count">{sessions?.data.length}</div>}
                                Sessies
                            </div>
                        </div>
                    </div>
                ))
            }>
            {auth2faRestricted ? (
                <Auth2FARestriction
                    type={'sessions'}
                    items={auth2FAState.restrictions.sessions.funds}
                    itemName={'name'}
                    itemThumbnail={'logo.sizes.thumbnail'}
                    defaultThumbnail={'fund-thumbnail'}
                />
            ) : (
                sessions && (
                    <Fragment>
                        {sessions?.data.map((session) => (
                            <div className="card" key={session.uid}>
                                <div className="card-section card-section-padless">
                                    <div className="block block-sessions">
                                        <div className="session-item">
                                            <div className="session-icon">
                                                <div className={`mdi mdi-${findIcon(session)}`} />
                                            </div>
                                            <div className="session-details">
                                                <div className="session-title">
                                                    <span>{titles[session.client_type]}</span>
                                                    <span className="text-primary text-separator"> • </span>
                                                    <span>{session.last_request.device_string}</span>
                                                </div>
                                                <div className="session-properties">
                                                    <div className="session-property">
                                                        <div className="session-property-label">Laatste activiteit</div>
                                                        <div className="session-property-value">
                                                            {session.last_request.time_passed_locale}
                                                            {session.last_request.location && (
                                                                <Fragment>
                                                                    <span className="session-property-sep text-primary hide-sm">
                                                                        •
                                                                    </span>
                                                                    <span>
                                                                        {`${session.last_request.location.ip} • ${session.last_request.location.string}`}
                                                                    </span>
                                                                </Fragment>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="session-property">
                                                        <div className="session-property-label">Sessie gestart</div>
                                                        <div className="session-property-value">
                                                            {session.started_at_locale}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="session-actions flex">
                                                    {session.locations?.length > 1 && (
                                                        <a
                                                            tabIndex={0}
                                                            onKeyDown={clickOnKeyEnter}
                                                            className="session-action"
                                                            onClick={() =>
                                                                setShownLocations({
                                                                    ...shownLocations,
                                                                    [session.uid]: !shownLocations[session.uid],
                                                                })
                                                            }>
                                                            Bekijk alle locaties
                                                            {shownLocations[session.uid] && (
                                                                <em className="mdi mdi-menu-up" />
                                                            )}
                                                            {!shownLocations[session.uid] && (
                                                                <em className="mdi mdi-menu-right" />
                                                            )}
                                                        </a>
                                                    )}

                                                    <a
                                                        tabIndex={0}
                                                        onKeyDown={clickOnKeyEnter}
                                                        onClick={() => terminateSession(session)}
                                                        className="session-action">
                                                        Beëindig sessie
                                                        <em className="mdi mdi-close" />
                                                    </a>
                                                </div>

                                                {session.locations?.length > 1 && shownLocations[session.uid] && (
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
                                                    <div className="label label-lg label-primary">Huidig</div>
                                                </div>
                                            )}

                                            {session.active && !session.current && (
                                                <div className="session-label">
                                                    <div className="label label-lg label-success">Online</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {sessions && (
                            <section>
                                <div className="card">
                                    <div className="card-section text-right">
                                        <button
                                            type={'button'}
                                            className="button button-primary"
                                            onClick={() => terminateAllSessions()}>
                                            Beëindig alle sessies
                                            <em className="mdi mdi-close icon-end" />
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </Fragment>
                )
            )}
        </BlockShowcaseProfile>
    );
}
