import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../../hooks/useSetProgress';
import { ApiResponseSingle, ResponseError, ResponseErrorData } from '../../../../props/ApiResponses';
import Implementation from '../../../../props/models/Implementation';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import ImplementationPageBlock from '../../../../props/models/ImplementationPageBlock';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import SelectControl from '../../../elements/select-control/SelectControl';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import ImplementationsBlockEditor from '../../implementations-edit/elements/ImplementationsBlockEditor';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useTranslate from '../../../../hooks/useTranslate';
import FaqEditor from '../../../elements/faq-editor-funds/FaqEditor';
import Faq from '../../../../props/models/Faq';
import { uniqueId } from 'lodash';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import ImplementationsInlineBlockEditor from './ImplementationsInlineBlockEditor';
import usePushApiError from '../../../../hooks/usePushApiError';
import ImplementationsRootBreadcrumbs from '../../implementations/elements/ImplementationsRootBreadcrumbs';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import FormPane from '../../../elements/forms/elements/FormPane';
import FormPaneContainer from '../../../elements/forms/elements/FormPaneContainer';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function ImplementationsPageForm({
    page,
    pageType,
    implementation,
}: {
    page?: ImplementationPage;
    pageType: string;
    implementation: Implementation;
}) {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const implementationPageService = useImplementationPageService();

    const [faq, setFaq] = useState<Array<Faq & { uid: string }>>(
        page?.faq?.map((item) => ({ ...item, uid: uniqueId() })) || [],
    );

    const [blocks, setBlocks] = useState<Array<ImplementationPageBlock & { uid: string }>>(
        page?.blocks?.map((item) => ({ ...item, uid: uniqueId() })) || [],
    );

    const [pageBlockProducts, setPageBlockProducts] = useState<ImplementationPage>(null);
    const [pageBlockProductCategories, setPageBlockProductCategories] = useState<ImplementationPage>(null);

    const cmsBlockEditorRef = useRef<() => Promise<boolean>>();
    const cmsBlockEditorRef2 = useRef<() => Promise<boolean>>();
    const faqEditorValidateRef = useRef<() => Promise<boolean>>();
    const blockEditorValidateRef = useRef<() => Promise<boolean>>();

    const pageTypeConfig = useMemo(
        () => implementation.page_types.find((type) => type.key === pageType),
        [implementation.page_types, pageType],
    );

    const [states] = useState([
        { value: 'draft', name: 'Draft' },
        { value: 'public', name: 'Public' },
    ]);

    const [types] = useState([
        { value: false, name: 'Internal page' },
        { value: true, name: 'External page' },
    ]);

    const [blocksPerRow] = useState([
        { value: 1, name: 1 },
        { value: 2, name: 2 },
        { value: 3, name: 3 },
    ]);

    const [descriptionPositions] = useState([
        { value: 'replace', name: 'Standaard content overschrijven' },
        { value: 'before', name: 'Voor de standaard content tonen' },
        { value: 'after', name: 'Na de standaard content tonen' },
    ]);

    const form = useFormBuilder<{
        state?: string;
        external?: boolean;
        page_type?: string;
        blocks?: Array<ImplementationPageBlock>;
        description?: string;
        external_url?: string;
        blocks_per_row?: number;
        description_html?: string;
        implementation_id?: number;
        description_position?: string;
        description_alignment?: string;
    }>(
        page
            ? implementationPageService.apiResourceToForm(page)
            : {
                  blocks: [],
                  state: states[0].value,
                  external: types[0].value,
                  page_type: pageType,
                  blocks_per_row: blocksPerRow[0].value,
                  description_position: descriptionPositions[0]?.value,
              },
        async (values) => {
            const data = { ...values, blocks, faq };

            try {
                if (
                    (cmsBlockEditorRef?.current && !(await cmsBlockEditorRef?.current())) ||
                    (cmsBlockEditorRef2?.current && !(await cmsBlockEditorRef2?.current())) ||
                    (faqEditorValidateRef?.current && !(await faqEditorValidateRef?.current())) ||
                    (blockEditorValidateRef?.current && !(await blockEditorValidateRef?.current()))
                ) {
                    return form.setIsLocked(false);
                }
            } catch (e) {
                pushDanger('Error!', typeof e == 'string' ? e : e.message || '');
                return form.setIsLocked(false);
            }

            setProgress(0);

            const promise: Promise<ApiResponseSingle<ImplementationPage>> = page
                ? implementationPageService.update(activeOrganization.id, implementation.id, page.id, data)
                : implementationPageService.store(activeOrganization.id, implementation.id, data);

            promise
                .then((res) => {
                    if (!page) {
                        return navigateState(DashboardRoutes.IMPLEMENTATION_VIEW_PAGE_EDIT, {
                            organizationId: implementation.organization_id,
                            implementationId: implementation.id,
                            id: res.data.data.id,
                        });
                    }

                    form.update(implementationPageService.apiResourceToForm(res.data.data));
                    form.setErrors({});
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const fetchPageBlocks = useCallback(() => {
        implementationPageService
            .list(implementation.organization_id, implementation.id)
            .then((res) => {
                setPageBlockProducts(
                    res.data.data?.find((page) => page.page_type === 'block_home_products') || {
                        state: 'draft',
                        title: '',
                        description: '',
                    },
                );

                setPageBlockProductCategories(
                    res.data.data?.find((page) => page.page_type === 'block_home_product_categories') || {
                        state: 'draft',
                        title: '',
                        description: '',
                    },
                );
            })
            .catch(pushApiError);
    }, [implementation, implementationPageService, pushApiError]);

    useEffect(() => {
        if (!pageTypeConfig?.key) {
            pushDanger('Mislukt!', 'Ongeldig paginatype.');

            return navigateState(DashboardRoutes.IMPLEMENTATION, {
                id: implementation.id,
                organizationId: activeOrganization.id,
            });
        }
    }, [activeOrganization?.id, implementation.id, navigateState, pageTypeConfig?.key, pushDanger]);

    useEffect(() => {
        if (pageTypeConfig?.key === 'home') {
            fetchPageBlocks();
        }
    }, [pageTypeConfig?.key, fetchPageBlocks]);

    if (!pageTypeConfig || (pageTypeConfig?.key === 'home' && !pageBlockProducts)) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">{translate(`implementation_edit.labels.${pageType}`)}</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="flex flex-grow card-title">
                            {translate(`implementation_edit.labels.${pageType}`)}
                        </div>

                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                {(page?.state == 'public' || pageTypeConfig.type === 'static') && (
                                    <a
                                        className="button button-text button-sm"
                                        href={pageTypeConfig.webshop_url}
                                        rel="noreferrer"
                                        target="_blank">
                                        Bekijk pagina
                                        <em className="mdi mdi-open-in-new icon-end" />
                                    </a>
                                )}

                                <button className="button button-primary button-sm" type="submit">
                                    {translate('funds_edit.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <FormPaneContainer className="card-section">
                        <FormPane title="Page content">
                            <FormGroup
                                label="Status"
                                error={form.errors.state}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        className="form-control"
                                        propKey={'value'}
                                        value={form.values?.state}
                                        onChange={(state: string) => form.update({ state })}
                                        options={states}
                                    />
                                )}
                            />

                            {pageTypeConfig.type === 'extra' && (
                                <FormGroup
                                    label="Pagina type"
                                    info={
                                        <Fragment>
                                            De interne privacyverklaring pagina wordt gehost op ons webshopdomein.
                                            Hieronder kunt u de inhoud van de pagina aanpassen. U kunt er ook voor
                                            kiezen om een externe privacyverklaring te gebruiken en de
                                            doorverwijzingslink op te geven.
                                        </Fragment>
                                    }
                                    error={form.errors.external}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            className="form-control"
                                            propKey={'value'}
                                            value={form.values?.external}
                                            onChange={(external: boolean) => form.update({ external })}
                                            options={types}
                                        />
                                    )}
                                />
                            )}

                            {form.values?.external ? (
                                <FormGroup
                                    label="Externe url"
                                    error={form.errors?.external_url}
                                    input={(id) => (
                                        <input
                                            id={id}
                                            type="text"
                                            className="form-control"
                                            placeholder={translate(`implementation_edit.placeholders.${pageType}`)}
                                            value={form.values?.external_url || ''}
                                            onChange={(e) => form.update({ external_url: e.target.value })}
                                        />
                                    )}
                                />
                            ) : (
                                <FormGroup
                                    label={translate(`implementation_edit.labels.${pageType}`)}
                                    error={form.errors?.description}
                                    input={() => (
                                        <MarkdownEditor
                                            alignment={form.values?.description_alignment}
                                            extendedOptions={true}
                                            allowAlignment={true}
                                            value={form.values?.description_html}
                                            onChange={(value) => form.update({ description: value })}
                                        />
                                    )}
                                />
                            )}

                            {pageTypeConfig.description_position_configurable && !form.values?.external && (
                                <FormGroup
                                    label="Positie van de content"
                                    error={form.errors.description_position}
                                    info={translate(`implementation_edit.tooltips.${pageType}`)}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            className="form-control"
                                            propKey={'value'}
                                            value={form.values?.description_position}
                                            onChange={(description_position: string) => {
                                                form.update({ description_position });
                                            }}
                                            options={descriptionPositions}
                                        />
                                    )}
                                />
                            )}
                        </FormPane>

                        {pageTypeConfig.key == 'home' && (
                            <FormPane title="Aanbod sectie">
                                <ImplementationsInlineBlockEditor
                                    blockKey={'block_home_products'}
                                    activeOrganization={activeOrganization}
                                    implementation={implementation}
                                    pageBlock={pageBlockProducts}
                                    setPageBlock={setPageBlockProducts}
                                    saveBlockRef={cmsBlockEditorRef}
                                />
                            </FormPane>
                        )}

                        {pageTypeConfig.key == 'home' && (
                            <FormPane title="Aanbod categorieën sectie">
                                <ImplementationsInlineBlockEditor
                                    blockKey={'block_home_product_categories'}
                                    state={true}
                                    markdown={false}
                                    activeOrganization={activeOrganization}
                                    implementation={implementation}
                                    pageBlock={pageBlockProductCategories}
                                    setPageBlock={setPageBlockProductCategories}
                                    saveBlockRef={cmsBlockEditorRef2}
                                />
                            </FormPane>
                        )}

                        {pageTypeConfig.blocks && !form.values?.external && (
                            <FormPane title="Blokken">
                                <FormGroup
                                    label={'Blokken'}
                                    input={() => (
                                        <ImplementationsBlockEditor
                                            blocks={blocks}
                                            setBlocks={setBlocks}
                                            errors={form.errors}
                                            setErrors={(errors: ResponseErrorData) => form.setErrors(errors)}
                                            createFaqRef={faqEditorValidateRef}
                                            implementation={implementation}
                                        />
                                    )}
                                />

                                <FormGroup
                                    label={'Blokken per rij'}
                                    input={() => (
                                        <SelectControl
                                            className="form-control"
                                            propKey={'value'}
                                            value={form.values?.blocks_per_row}
                                            onChange={(blocks_per_row: number) => form.update({ blocks_per_row })}
                                            options={blocksPerRow}
                                        />
                                    )}
                                />
                            </FormPane>
                        )}

                        {pageTypeConfig.faq && !form.values?.external && (
                            <FormGroup
                                label="Veel gestelde vragen"
                                input={() => (
                                    <FaqEditor
                                        faq={faq}
                                        setFaq={setFaq}
                                        organization={activeOrganization}
                                        errors={form?.errors}
                                        setErrors={(errors: ResponseErrorData) => form.setErrors(errors)}
                                        createFaqRef={blockEditorValidateRef}
                                    />
                                )}
                            />
                        )}
                    </FormPaneContainer>
                    <div className="card-footer">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={DashboardRoutes.IMPLEMENTATION}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className="button button-default">
                                {translate('funds_edit.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {translate('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
