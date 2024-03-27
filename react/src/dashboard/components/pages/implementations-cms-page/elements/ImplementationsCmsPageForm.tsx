import React, { Fragment, useCallback, useMemo, useState } from 'react';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import FormError from '../../../elements/forms/errors/FormError';
import useSetProgress from '../../../../hooks/useSetProgress';
import { ResponseError } from '../../../../props/ApiResponses';
import Implementation from '../../../../props/models/Implementation';
import ImplementationPage, {
    ImplementationPageBlock,
    ImplementationPageFaq,
} from '../../../../props/models/ImplementationPage';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../../elements/select-control/SelectControl';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import ImplementationsBlockEditor from './ImplementationsBlockEditor';
import { uniq } from 'lodash';
import ImplementationsFaqEditor from './ImplementationsFaqEditor';
import useFaqService from '../../../../services/FaqService';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';

export default function ImplementationsCmsPageForm({
    implementation,
    page_type,
    page,
}: {
    implementation: Implementation;
    page_type: string;
    page?: ImplementationPage;
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const faqService = useFaqService();
    const implementationPageService = useImplementationPageService();

    const [showInfoBlockType, setShowInfoBlockType] = useState(false);
    const [showInfoBlockTypePosition, setShowInfoBlockTypePosition] = useState(false);
    const pageTypeConfig = useMemo(
        () => implementation.page_types.find((type) => type.key === page_type),
        [implementation.page_types, page_type],
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

    const mapFaqFakeId = useCallback((faqs: Array<ImplementationPageFaq>) => {
        return faqs.map((faq) => {
            if (faq.id && faq.id.toString().startsWith('sortable_')) {
                delete faq.id;
            }

            return faq;
        });
    }, []);

    const form = useFormBuilder<{
        state?: string;
        external?: boolean;
        page_type?: string;
        blocks?: Array<ImplementationPageBlock>;
        faq?: Array<ImplementationPageFaq>;
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
                  faq: [],
                  state: states[0].value,
                  external: types[0].value,
                  page_type: page_type,
                  blocks_per_row: blocksPerRow[0].value,
                  description_position: descriptionPositions[0]?.value,
              },
        (values) => {
            const submit = () => {
                setProgress(0);

                const promise = page
                    ? implementationPageService.update(activeOrganization.id, implementation.id, page.id, values)
                    : implementationPageService.store(activeOrganization.id, implementation.id, values);

                promise
                    .then((res) => {
                        if (!page) {
                            return navigate(
                                getStateRouteUrl('implementations-cms-page-edit', {
                                    organizationId: implementation.organization_id,
                                    implementationId: implementation.id,
                                    id: res.data.data.id,
                                }),
                            );
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
            };

            form.setErrors({});

            Promise.all([validateBlocks(), validateFaqs()])
                .then(() => submit())
                .catch((error: string) => {
                    pushDanger('Error!', error);
                    form.setIsLocked(false);
                });
        },
    );

    const { update } = form;

    const expendByIndex = useCallback(
        (index, values, key) => {
            const list = Array.isArray(index) ? index : [index];

            for (let i = 0; i < list.length; i++) {
                values[list[i]].collapsed = true;
            }

            update({ [key]: values });
        },
        [update],
    );

    const processValidationErrors = useCallback(
        (res: ResponseError, values, key) => {
            const { errors } = res.data;

            if (errors && typeof errors == 'object') {
                form.setErrors((prevState) => ({
                    ...prevState,
                    ...errors,
                }));

                expendByIndex(
                    uniq(
                        Object.keys(errors).map((error) => {
                            return error.split('.')[1] || null;
                        }),
                    ).filter((rowIndex) => !isNaN(parseInt(rowIndex))),
                    values,
                    key,
                );
            }
        },
        [expendByIndex, form],
    );

    const validateBlocks = useCallback(() => {
        const data = { blocks: form.values.blocks };
        const { id, organization_id } = implementation;

        return new Promise((resolve, reject) => {
            implementationPageService
                .validateBlocks(organization_id, id, data)
                .then((res) => resolve(res.data))
                .catch((res: ResponseError) => {
                    processValidationErrors(res, [...form.values.blocks], 'blocks');
                    reject(
                        res.status == 422
                            ? t('components.implementation_block_editor.fix_validation_errors')
                            : res.data.message,
                    );
                });
        });
    }, [form.values?.blocks, implementation, implementationPageService, processValidationErrors, t]);

    const validateFaqs = useCallback(() => {
        return new Promise((resolve, reject) => {
            const faq = mapFaqFakeId([...form.values.faq]);

            faqService
                .faqValidate(implementation.organization_id, { faq })
                .then((res) => resolve(res.data))
                .catch((res: ResponseError) => {
                    processValidationErrors(res, [...form.values.faq], 'faq');
                    reject(res.status == 422 ? t('components.faq_editor.fix_validation_errors') : res.data.message);
                });
        });
    }, [faqService, form.values?.faq, implementation.organization_id, mapFaqFakeId, processValidationErrors, t]);

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
                <div className="breadcrumb-item active">{t(`implementation_edit.labels.${page_type}`)}</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header flex-row">
                        <div className="card-title">{t(`implementation_edit.labels.${page_type}`)}</div>
                        <div className="flex flex-grow flex-end">
                            {(page?.state == 'public' || pageTypeConfig.type === 'static') && (
                                <a
                                    className="button button-text button-sm"
                                    href={pageTypeConfig.webshop_url}
                                    rel="noreferrer"
                                    target="_blank">
                                    Bekijk pagina
                                    <div className="mdi mdi-open-in-new icon-end"></div>
                                </a>
                            )}

                            <button className="button button-primary button-sm" type="submit">
                                {t('funds_edit.buttons.confirm')}
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
                                            onChange={(state: string) => {
                                                form.update({ state });
                                            }}
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
                                                        onChange={(external: boolean) => {
                                                            form.update({ external });
                                                        }}
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
                                                            Internal pages are hosted on our webshop domain and you can
                                                            edit the content of the page below. Or you can select
                                                            external, to provider a custom url for the page.
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
                                            placeholder={t(`implementation_edit.placeholders.${page_type}`)}
                                            value={form.values?.external_url || ''}
                                            onChange={(e) => form.update({ external_url: e.target.value })}
                                        />
                                        <FormError error={form.errors.external_url} />
                                    </div>
                                ) : (
                                    <div className="form-group form-group-inline form-group-inline-xl tooltipped">
                                        <label className="form-label">
                                            {t(`implementation_edit.labels.${page_type}`)}
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
                                                            <p>{t(`implementation_edit.tooltips.${page_type}`)}</p>
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

                    {pageTypeConfig.blocks && !form.values?.external && (
                        <div className="card-section card-section-primary">
                            <div className="form-group form-group-inline form-group-inline-xl">
                                <label className="form-label">Blokken</label>

                                <ImplementationsBlockEditor
                                    blocks={form.values?.blocks}
                                    onChange={(blocks) => form.update({ blocks })}
                                    errors={form.errors}
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
                                            onChange={(blocks_per_row: number) => {
                                                form.update({ blocks_per_row });
                                            }}
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
                                    <ImplementationsFaqEditor
                                        faqs={form.values?.faq}
                                        onChange={(faq) => form.update({ faq })}
                                        errors={form.errors}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card-section card-section-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={'implementations-cms'}
                                params={{
                                    organizationId: activeOrganization.id,
                                    id: implementation.id,
                                }}
                                className="button button-default">
                                {t('funds_edit.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {t('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
