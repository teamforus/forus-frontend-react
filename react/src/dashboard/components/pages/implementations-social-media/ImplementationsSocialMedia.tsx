import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useNavigate, useParams } from 'react-router-dom';
import Implementation from '../../../props/models/Implementation';
import useFilter from '../../../hooks/useFilter';
import Paginator from '../../../modules/paginator/components/Paginator';
import ThSortable from '../../elements/tables/ThSortable';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useImplementationSocialMediaService from '../../../services/ImplementationSocialMediaService';
import ModalSocialMediaEdit from '../../modals/ModalSocialMediaEdit';
import ImplementationSocialMedia from '../../../props/models/ImplementationSocialMedia';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function ImplementationsSocialMedia() {
    const { id } = useParams();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();
    const implementationSocialMediaService = useImplementationSocialMediaService();

    const [paginatorKey] = useState('implementations_social_media');
    const [implementation, setImplementation] = useState<Implementation>(null);
    const [socialMedias, setSocialMedias] = useState<PaginationData<ImplementationSocialMedia>>(null);

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((res: ResponseError) => {
                if (res.status === 403) {
                    return navigate(getStateRouteUrl('implementations', { organizationId: activeOrganization.id }));
                }

                pushDanger('Mislukt!', res.data.message);
            });
    }, [implementationService, activeOrganization.id, id, pushDanger, navigate]);

    const fetchSocialMedias = useCallback(() => {
        if (implementation) {
            setProgress(0);

            implementationSocialMediaService
                .list(activeOrganization.id, implementation.id, filter.activeValues)
                .then((res) => setSocialMedias(res.data))
                .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message))
                .finally(() => setProgress(100));
        }
    }, [
        activeOrganization.id,
        filter.activeValues,
        implementation,
        implementationSocialMediaService,
        pushDanger,
        setProgress,
    ]);

    const editSocialMedia = useCallback(
        (socialMedia = null) => {
            openModal((modal) => (
                <ModalSocialMediaEdit
                    modal={modal}
                    organization={activeOrganization}
                    implementation={implementation}
                    socialMedia={socialMedia}
                    usedTypes={socialMedias.data.map((socialMedia) => socialMedia.type)}
                    onSubmit={() => fetchSocialMedias()}
                />
            ));
        },
        [activeOrganization, fetchSocialMedias, implementation, openModal, socialMedias?.data],
    );

    const deleteSocialMedia = useCallback(
        (socialMedia = null) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_implementation_social_media.title')}
                    description={t('modals.danger_zone.remove_implementation_social_media.description')}
                    buttonCancel={{
                        text: t('modals.danger_zone.remove_implementation_social_media.buttons.cancel'),
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: t('modals.danger_zone.remove_implementation_social_media.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            implementationSocialMediaService
                                .destroy(activeOrganization.id, implementation.id, socialMedia.id)
                                .then(() => {
                                    pushSuccess('Opgeslagen!');
                                    fetchSocialMedias();
                                })
                                .catch((res: ResponseError) => pushDanger('Error!', res?.data?.message));
                        },
                    }}
                />
            ));
        },
        [
            t,
            openModal,
            pushDanger,
            pushSuccess,
            fetchSocialMedias,
            implementation?.id,
            activeOrganization.id,
            implementationSocialMediaService,
        ],
    );

    useEffect(() => fetchImplementation(), [fetchImplementation]);
    useEffect(() => fetchSocialMedias(), [fetchSocialMedias]);

    if (!socialMedias) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'implementations'}
                    params={{ organizationId: activeOrganization.id }}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={'implementations-view'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <StateNavLink
                    name={'implementations-cms'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    className="breadcrumb-item">
                    Content Management System
                </StateNavLink>
                <div className="breadcrumb-item active">{t('implementation_edit.labels.cms_media_links')}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">{`Social media links (${socialMedias.meta.total})`}</div>
                        </div>
                        <div className="flex">
                            <div className="block block-inline-filters">
                                <a
                                    className="button button-primary button-sm"
                                    onClick={() => editSocialMedia()}
                                    id="add_social_media">
                                    <em className="mdi mdi-plus-circle icon-start" />
                                    Toevoegen
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {socialMedias.data.length > 0 && (
                    <div className="card-section card-section-primary">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <ThSortable className="th-narrow" label={'Icoon'} />
                                            <ThSortable label={'Soort'} />
                                            <ThSortable label={'URL'} />
                                            <ThSortable label={'Titel'} />
                                            <ThSortable className="th-narrow text-right" label={'Opties'} />
                                        </tr>

                                        {socialMedias.data.map((socialMedia) => (
                                            <tr key={socialMedia.id}>
                                                <td className="td-narrow">
                                                    <em className={`td-icon text-dark mdi mdi-${socialMedia.type}`} />
                                                </td>
                                                <td>{socialMedia.type_locale}</td>
                                                <td>{socialMedia.url}</td>
                                                <td>{socialMedia.title || '-'}</td>
                                                <td className="td-narrow text-right">
                                                    <div className="flex">
                                                        <a
                                                            className="button button-sm button-default"
                                                            onClick={() => editSocialMedia(socialMedia)}>
                                                            <em className="mdi mdi-pen icon-start" />
                                                            Bewerken
                                                        </a>
                                                        <button
                                                            className="button button-danger button-icon"
                                                            onClick={() => deleteSocialMedia(socialMedia)}>
                                                            <em className="icon-start mdi mdi-delete" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {socialMedias.meta.total == 0 && (
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-title">Er zijn momenteel geen social media.</div>
                        </div>
                    </div>
                )}

                {socialMedias?.meta && (
                    <div className="card-section">
                        <Paginator
                            meta={socialMedias.meta}
                            filters={filter.values}
                            updateFilters={filter.update}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </div>
        </Fragment>
    );
}
