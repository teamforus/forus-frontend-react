import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../../props/ApiResponses';
import { useNavigate, useParams } from 'react-router-dom';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalNotification from '../../../modals/ModalNotification';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import Implementation, { ImplementationPageType } from '../../../../props/models/Implementation';
import ThSortable from '../../../elements/tables/ThSortable';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';

type ImplementationPageLocal = ImplementationPage & {
    page_type_data: ImplementationPageType;
};

export default function ImplementationsCmsPages({ implementation }: { implementation: Implementation }) {
    const { id } = useParams();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const activeOrganization = useActiveOrganization();

    const implementationPageService = useImplementationPageService();

    const [pages, setPages] = useState<Array<ImplementationPageLocal>>(null);

    const fetchPages = useCallback(() => {
        implementationPageService
            .list(activeOrganization.id, parseInt(id))
            .then((res) => {
                const list = implementation.page_types.map((page_type_data) => {
                    const page = res.data.data.find((page) => page?.page_type == page_type_data.key) || {};
                    return { ...page, page_type_data };
                });

                setPages(list);
            })
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, id, implementation?.page_types, implementationPageService, pushDanger]);

    const deletePage = useCallback(
        (page) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    className={'modal-md'}
                    title={'Wilt u dit gegeven verwijderen?'}
                    description={
                        'Weet u zeker dat u dit gegeven wilt verwijderen? Deze actie kunt niet ongedaan maken, u kunt echter wel een nieuw gegeven aanmaken.'
                    }
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            implementationPageService
                                .destroy(page.implementation.organization_id, page.implementation.id, page.id)
                                .then(() => {
                                    fetchPages();
                                    pushSuccess('Success!', 'Implementation page delete!');
                                })
                                .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
                        },
                    }}
                    buttonCancel={{
                        onClick: () => modal.close(),
                    }}
                />
            ));
        },
        [fetchPages, implementationPageService, openModal, pushDanger, pushSuccess],
    );

    const goToPageCreate = useCallback(
        (type) => {
            navigate({
                pathname: getStateRouteUrl('implementations-cms-page-create', {
                    organizationId: activeOrganization.id,
                    implementationId: implementation.id,
                }),
                search: `?type=${type}`,
            });
        },
        [navigate],
    );

    useEffect(() => fetchPages(), [fetchPages]);

    if (!pages) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{t('implementation_edit.implementations_table.title')}</div>
            </div>
            <div className="card-section">
                <div className="card-block card-block-table">
                    <div className="table-wrapper">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <ThSortable label="Naam" />
                                    <ThSortable label="Type" />
                                    <ThSortable label="Blokken" />
                                    <ThSortable label="Gepubliceerd" />
                                    <ThSortable className="th-narrow nowrap" label="Webshop URL" />
                                    <ThSortable className="th-narrow text-right" label="Opties" />
                                </tr>

                                {pages.map((page) => (
                                    <tr key={page.page_type_data.key}>
                                        <td>{t(`implementation_edit.labels.${page.page_type_data.key}`)}</td>
                                        {page.page_type_data.type === 'static' && (
                                            <td className="text-muted">Standaard pagina</td>
                                        )}

                                        {page.page_type_data.type === 'extra' && (
                                            <td className="text-muted">Optionele pagina</td>
                                        )}

                                        {page.page_type_data.type === 'element' && (
                                            <td className="text-muted">Pagina element</td>
                                        )}

                                        {page.page_type_data.blocks ? (
                                            <td>{page.blocks?.length || 'None'}</td>
                                        ) : (
                                            <td className="text-muted">Niet beschikbaar</td>
                                        )}

                                        <td>{page.state == 'public' ? 'Ja' : 'Nee'}</td>
                                        <td>
                                            {(page.id && page.state === 'public') ||
                                            page.page_type_data.type == 'static' ? (
                                                <a
                                                    className="button button-sm button-text"
                                                    href={page.page_type_data.webshop_url}
                                                    rel="noreferrer"
                                                    target="_blank">
                                                    Bekijk
                                                    <em className="mdi mdi-open-in-new icon-end" />
                                                </a>
                                            ) : (
                                                <div className="text-muted">-</div>
                                            )}
                                        </td>
                                        <td className="td-narrow text-right">
                                            <div className="flex">
                                                {page.id ? (
                                                    <StateNavLink
                                                        name={'implementations-cms-page-edit'}
                                                        params={{
                                                            organizationId: activeOrganization.id,
                                                            implementationId: implementation.id,
                                                            id: page.id,
                                                        }}
                                                        className="button button-sm button-default">
                                                        <em className="mdi mdi-pen icon-start" />
                                                        {t('implementation_edit.implementations_table.labels.edit')}
                                                    </StateNavLink>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => goToPageCreate(page.page_type_data.key)}
                                                        className="button button-sm button-primary">
                                                        <em className="mdi mdi-plus icon-start" />
                                                        {t('implementation_edit.implementations_table.labels.edit')}
                                                    </button>
                                                )}

                                                <button
                                                    className="button button-danger button-icon"
                                                    disabled={!page.id}
                                                    onClick={() => deletePage(page)}>
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
        </div>
    );
}
