import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import FormError from '../../../elements/forms/errors/FormError';
import useSetProgress from '../../../../hooks/useSetProgress';
import { ApiResponseSingle, ResponseError, ResponseErrorData } from '../../../../props/ApiResponses';
import Implementation from '../../../../props/models/Implementation';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import ImplementationPageBlock from '../../../../props/models/ImplementationPageBlock';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../../elements/select-control/SelectControl';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import ImplementationsBlockEditor from './ImplementationsBlockEditor';
import { useNavigateState } from '../../../../modules/state_router/Router';
import useTranslate from '../../../../hooks/useTranslate';
import FaqEditor from '../../../elements/faq-editor-funds/FaqEditor';
import Faq from '../../../../props/models/Faq';
import { uniqueId } from 'lodash';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import ImplementationsCmsHomeProductsBlockEditor from './ImplementationsCmsHomeProductsBlockEditor';

export default function ImplementationsCmsPageForm({
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
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const implementationPageService = useImplementationPageService();

    const [faq, setFaq] = useState<Array<Faq & { uid: string }>>(
        page?.faq?.map((item) => ({ ...item, uid: uniqueId() })) || [],
    );

    const [blocks, setBlocks] = useState<Array<ImplementationPageBlock & { uid: string }>>(
        page?.blocks?.map((item) => ({ ...item, uid: uniqueId() })) || [],
    );

    const [pageBlock, setPageBlock] = useState<ImplementationPage>(null);

    const cmsBlockEditorRef = useRef<() => Promise<boolean>>();
    const faqEditorValidateRef = useRef<() => Promise<boolean>>();
    const blockEditorValidateRef = useRef<() => Promise<boolean>>();

    const [showInfoBlockType, setShowInfoBlockType] = useState(false);
    const [showInfoBlockTypePosition, setShowInfoBlockTypePosition] = useState(false);

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
                        return navigateState('implementations-cms-page-edit', {
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
                    pushDanger('Mislukt!', err.data.message);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const fetchPageByKey = useCallback(
        (key: string) => {
            implementationPageService
                .list(implementation.organization_id, implementation.id, { key })
                .then((res) => {
                    setPageBlock(
                        res.data.data?.find((page) => page.page_type === key) || {
                            title: '',
                            description: '',
                        },
                    );
                })
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
        },
        [implementation, implementationPageService, pushDanger],
    );

    useEffect(() => {
        if (!pageTypeConfig?.key) {
            pushDanger('Mislukt!', 'Ongeldig paginatype.');

            return navigateState('implementations-cms', {
                id: implementation.id,
                organizationId: activeOrganization.id,
            });
        }
    }, [activeOrganization?.id, implementation.id, navigateState, pageTypeConfig?.key, pushDanger]);

    useEffect(() => {
        if (pageTypeConfig?.key === 'home') {
            fetchPageByKey('block_home_products');
        }
    }, [pageTypeConfig?.key, fetchPageByKey]);

    if (!pageTypeConfig || (pageTypeConfig?.key === 'home' && !pageBlock)) {
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
                <div className="breadcrumb-item active">{translate(`implementation_edit.labels.${pageType}`)}</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header flex-row">
                        <div className="card-title">{translate(`implementation_edit.labels.${pageType}`)}</div>
                        <div className="flex flex-grow flex-end">
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

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9">
                                <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                    <label className="form-label">Status</label>
                                    <div className="form-offset">
                                        <SelectControl
                                            className="form-control"
                                            propKey={'value'}
                                            value={form.values?.state}
                                            onChange={(state: string) => form.update({ state })}
                                            options={states}
                                            optionsComponent={SelectControlOptions}
                                        />
                                        <FormError error={form.errors.state} />
                                    </div>
                                </div>

                                {pageTypeConfig.type === 'extra' && (
                                    <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                        <label className="form-label">Pagina type</label>
                                        <div className="form-offset">
                                            <div className="form-group-info">
                                                <div className="form-group-info-control">
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'value'}
                                                        value={form.values?.external}
                                                        onChange={(external: boolean) => form.update({ external })}
                                                        options={types}
                                                        optionsComponent={SelectControlOptions}
                                                    />
                                                </div>
                                                <div className="form-group-info-button">
                                                    <div
                                                        className={`button button-default button-icon pull-left ${
                                                            showInfoBlockType ? 'active' : ''
                                                        }`}
                                                        onClick={() => setShowInfoBlockType(!showInfoBlockType)}>
                                                        <em className="mdi mdi-information" />
                                                    </div>
                                                </div>
                                            </div>

                                            {showInfoBlockType && (
                                                <div className="block block-info-box block-info-box-primary">
                                                    <div className="info-box-icon mdi mdi-information" />
                                                    <div className="info-box-content">
                                                        <div className="block block-markdown">
                                                            De interne privacyverklaring pagina wordt gehost op ons
                                                            webshopdomein. Hieronder kunt u de inhoud van de pagina
                                                            aanpassen. U kunt er ook voor kiezen om een externe
                                                            privacyverklaring te gebruiken en de doorverwijzingslink op
                                                            te geven.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <FormError error={form.errors.external} />
                                        </div>
                                    </div>
                                )}

                                {form.values?.external ? (
                                    <div className="form-group form-group-inline form-group-inline-xl">
                                        <label className="form-label" htmlFor="external_url">
                                            Externe url
                                        </label>
                                        <input
                                            id="external_url"
                                            type="text"
                                            className="form-control"
                                            placeholder={translate(`implementation_edit.placeholders.${pageType}`)}
                                            value={form.values?.external_url || ''}
                                            onChange={(e) => form.update({ external_url: e.target.value })}
                                        />
                                        <FormError error={form.errors.external_url} />
                                    </div>
                                ) : (
                                    <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                        <label className="form-label">
                                            {translate(`implementation_edit.labels.${pageType}`)}
                                        </label>
                                        <div className="form-offset">
                                            <MarkdownEditor
                                                alignment={form.values?.description_alignment}
                                                extendedOptions={true}
                                                allowAlignment={true}
                                                value={form.values?.description_html}
                                                onChange={(value) => form.update({ description: value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {pageTypeConfig.description_position_configurable && !form.values?.external && (
                                    <div className="form-group form-group-inline form-group-inline-xl">
                                        <label className="form-label">Positie van de content</label>
                                        <div className="form-offset">
                                            <div className="form-group-info">
                                                <div className="form-group-info-control">
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'value'}
                                                        value={form.values?.description_position}
                                                        onChange={(description_position: string) => {
                                                            form.update({ description_position });
                                                        }}
                                                        options={descriptionPositions}
                                                        optionsComponent={SelectControlOptions}
                                                    />
                                                </div>
                                                <div className="form-group-info-button">
                                                    <div
                                                        className={`button button-default button-icon pull-left ${
                                                            showInfoBlockTypePosition ? 'active' : ''
                                                        }`}
                                                        onClick={() =>
                                                            setShowInfoBlockTypePosition(!showInfoBlockTypePosition)
                                                        }>
                                                        <em className="mdi mdi-information" />
                                                    </div>
                                                </div>
                                            </div>

                                            {showInfoBlockTypePosition && (
                                                <div className="block block-info-box block-info-box-primary">
                                                    <div className="info-box-icon mdi mdi-information" />
                                                    <div className="info-box-content">
                                                        <div className="block block-markdown">
                                                            <p>
                                                                {translate(`implementation_edit.tooltips.${pageType}`)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <FormError error={form.errors.description_position} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {pageTypeConfig.key == 'home' && (
                        <div className="card-section card-section-primary">
                            <ImplementationsCmsHomeProductsBlockEditor
                                activeOrganization={activeOrganization}
                                implementation={implementation}
                                pageBlock={pageBlock}
                                setPageBlock={setPageBlock}
                                saveBlockRef={cmsBlockEditorRef}
                            />
                        </div>
                    )}

                    {pageTypeConfig.blocks && !form.values?.external && (
                        <div className="card-section card-section-primary">
                            <div className="form-group form-group-inline form-group-inline-xl">
                                <label className="form-label">Blokken</label>

                                <ImplementationsBlockEditor
                                    blocks={blocks}
                                    setBlocks={setBlocks}
                                    errors={form.errors}
                                    setErrors={(errors: ResponseErrorData) => form.setErrors(errors)}
                                    createFaqRef={faqEditorValidateRef}
                                    implementation={implementation}
                                />
                            </div>

                            <div className="row">
                                <div className="col col-lg-9">
                                    <div className="form-group form-group-inline form-group-inline-xl">
                                        <label className="form-label">Blokken per rij</label>
                                        <SelectControl
                                            className="form-control"
                                            propKey={'value'}
                                            value={form.values?.blocks_per_row}
                                            onChange={(blocks_per_row: number) => form.update({ blocks_per_row })}
                                            options={blocksPerRow}
                                            optionsComponent={SelectControlOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {pageTypeConfig.faq && !form.values?.external && (
                        <div className="card-section card-section-primary">
                            <div className="form-group form-group-inline form-group-inline-xl">
                                <label className="form-label">Veel gestelde vragen</label>
                                <div className="form-offset">
                                    <FaqEditor
                                        faq={faq}
                                        setFaq={setFaq}
                                        organization={activeOrganization}
                                        errors={form?.errors}
                                        setErrors={(errors: ResponseErrorData) => form.setErrors(errors)}
                                        createFaqRef={blockEditorValidateRef}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card-section card-section-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={'implementations-cms'}
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
