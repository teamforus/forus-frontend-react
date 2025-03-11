import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalNotification from '../../../modals/ModalNotification';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import Implementation from '../../../../props/models/Implementation';
import ThSortable from '../../../elements/tables/ThSortable';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import useTranslate from '../../../../hooks/useTranslate';
import { keyBy } from 'lodash';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function ImplementationsCmsPages({ implementation }: { implementation: Implementation }) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const implementationPageService = useImplementationPageService();

    const pageTypes = useMemo(() => {
        return implementation.page_types.filter((type) => type.type !== 'block');
    }, [implementation.page_types]);

    const [pagesByKey, setPagesByKey] = useState<{ [key: string]: ImplementationPage }>(null);

    const fetchPages = useCallback(() => {
        implementationPageService
            .list(implementation.organization_id, implementation.id)
            .then((res) => setPagesByKey(keyBy(res.data.data, 'page_type')))
            .catch(pushApiError);
    }, [implementation, implementationPageService, pushApiError]);

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
                                .catch(pushApiError);
                        },
                    }}
                    buttonCancel={{ onClick: () => modal.close() }}
                />
            ));
        },
        [fetchPages, implementationPageService, openModal, pushApiError, pushSuccess],
    );

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    if (!pagesByKey) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{translate('implementation_edit.implementations_table.title')}</div>
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

                                {pageTypes.map((pageType) => (
                                    <tr key={pageType.key}>
                                        <td>{translate(`implementation_edit.labels.${pageType.key}`)}</td>
                                        {pageType.type === 'static' && <td className="text-muted">Standaard pagina</td>}
                                        {pageType.type === 'extra' && <td className="text-muted">Optionele pagina</td>}
                                        {pageType.type === 'element' && <td className="text-muted">Pagina element</td>}

                                        {pageType.blocks ? (
                                            <td>{pagesByKey?.[pageType.key]?.blocks?.length || 'None'}</td>
                                        ) : (
                                            <td className="text-muted">Niet beschikbaar</td>
                                        )}

                                        <td>{pagesByKey?.[pageType.key]?.state == 'public' ? 'Ja' : 'Nee'}</td>
                                        <td>
                                            {(pagesByKey?.[pageType.key]?.id &&
                                                pagesByKey?.[pageType.key]?.state === 'public') ||
                                            pageType.type == 'static' ? (
                                                <a
                                                    className="button button-sm button-text"
                                                    href={pageType.webshop_url}
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
                                                {pagesByKey?.[pageType.key]?.id ? (
                                                    <StateNavLink
                                                        name={'implementations-cms-page-edit'}
                                                        params={{
                                                            id: pagesByKey?.[pageType.key]?.id,
                                                            implementationId: implementation.id,
                                                            organizationId: implementation.organization_id,
                                                        }}
                                                        className="button button-sm button-default">
                                                        <em className="mdi mdi-pen icon-start" />
                                                        {translate(
                                                            'implementation_edit.implementations_table.labels.edit',
                                                        )}
                                                    </StateNavLink>
                                                ) : (
                                                    <StateNavLink
                                                        name={'implementations-cms-page-create'}
                                                        params={{
                                                            organizationId: implementation.organization_id,
                                                            implementationId: implementation.id,
                                                        }}
                                                        query={{ type: pageType.key }}
                                                        className="button button-sm button-primary">
                                                        <em className="mdi mdi-plus icon-start" />
                                                        {translate(
                                                            'implementation_edit.implementations_table.labels.edit',
                                                        )}
                                                    </StateNavLink>
                                                )}

                                                <button
                                                    className="button button-danger button-icon"
                                                    disabled={!pagesByKey?.[pageType.key]?.id}
                                                    onClick={() => deletePage(pagesByKey?.[pageType.key])}>
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
