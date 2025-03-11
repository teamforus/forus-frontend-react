import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import Paginator from '../../../modules/paginator/components/Paginator';
import ThSortable from '../../elements/tables/ThSortable';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useImplementationSocialMediaService from '../../../services/ImplementationSocialMediaService';
import ModalSocialMediaEdit from '../../modals/ModalSocialMediaEdit';
import ImplementationSocialMedia from '../../../props/models/ImplementationSocialMedia';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { NumberParam } from 'use-query-params';
import { useParams } from 'react-router-dom';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import usePushApiError from '../../../hooks/usePushApiError';

export default function ImplementationsSocialMedia() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();
    const implementationSocialMediaService = useImplementationSocialMediaService();

    const [paginatorKey] = useState('implementations_social_media');
    const [implementation, setImplementation] = useState<Implementation>(null);
    const [socialMedias, setSocialMedias] = useState<PaginationData<ImplementationSocialMedia>>(null);

    const [filterValues, filterActiveValues, filterUpdate] = useFilterNext<{
        page?: number;
        per_page?: number;
    }>(
        {
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: { page: NumberParam, per_page: NumberParam },
            queryParamsRemoveDefault: true,
        },
    );

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState('implementations', { organizationId: activeOrganization.id });
                }

                pushApiError(err);
            });
    }, [implementationService, activeOrganization.id, id, pushApiError, navigateState]);

    const fetchSocialMedias = useCallback(() => {
        if (implementation) {
            setProgress(0);

            implementationSocialMediaService
                .list(activeOrganization.id, implementation.id, filterActiveValues)
                .then((res) => setSocialMedias(res.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        }
    }, [
        activeOrganization.id,
        filterActiveValues,
        implementation,
        implementationSocialMediaService,
        pushApiError,
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
                    title={translate('modals.danger_zone.remove_implementation_social_media.title')}
                    description={translate('modals.danger_zone.remove_implementation_social_media.description')}
                    buttonCancel={{
                        text: translate('modals.danger_zone.remove_implementation_social_media.buttons.cancel'),
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.remove_implementation_social_media.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            setProgress(0);

                            implementationSocialMediaService
                                .destroy(activeOrganization.id, implementation.id, socialMedia.id)
                                .then(() => {
                                    pushSuccess('Opgeslagen!');
                                    fetchSocialMedias();
                                })
                                .catch(pushApiError)
                                .finally(() => {
                                    setProgress(100);
                                });
                        },
                    }}
                />
            ));
        },
        [
            openModal,
            translate,
            setProgress,
            implementationSocialMediaService,
            activeOrganization?.id,
            implementation?.id,
            pushSuccess,
            fetchSocialMedias,
            pushApiError,
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
                    activeExact={true}
                    className="breadcrumb-item">
                    Webshops
                </StateNavLink>
                <StateNavLink
                    name={'implementations-view'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
                <StateNavLink
                    name={'implementations-cms'}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Content Management System
                </StateNavLink>
                <div className="breadcrumb-item active">{translate('implementation_edit.labels.cms_media_links')}</div>
            </div>

            <div className="card">
                <div className="card-header card-header-next">
                    <div className="flex flex-grow card-title">
                        <div className="card-title">{`Social media links (${socialMedias.meta.total})`}</div>
                    </div>
                    <div className="card-header-filters">
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
                                                    <div className={`td-icon text-dark mdi mdi-${socialMedia.type}`} />
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
                    <EmptyCard type={'card-section'} title={'Er zijn momenteel geen social media.'} />
                )}

                {socialMedias?.meta && (
                    <div className="card-section">
                        <Paginator
                            meta={socialMedias.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </div>
        </Fragment>
    );
}
