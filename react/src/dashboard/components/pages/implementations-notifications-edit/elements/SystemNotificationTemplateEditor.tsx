import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FormError from '../../../elements/forms/errors/FormError';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import ToggleControl from '../../../elements/forms/controls/ToggleControl';
import useImplementationNotificationService from '../../../../services/ImplementationNotificationService';
import Implementation from '../../../../props/models/Implementation';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import SystemNotification from '../../../../props/models/SystemNotification';
import Fund from '../../../../props/models/Fund';
import usePushDanger from '../../../../hooks/usePushDanger';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalMailPreview from '../../../modals/ModalMailPreview';
import variablesMap from '../../../../services/constants/notification_templates/variables.json';
import variablesMapLabels from '../../../../services/constants/notification_templates/variables_labels.json';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import { ResponseError, ResponseErrorData } from '../../../../props/ApiResponses';
import useTranslate from '../../../../hooks/useTranslate';
import NotificationTemplate from '../../../../props/models/NotificationTemplate';
import { uniqueId } from 'lodash';
import useSetProgress from '../../../../hooks/useSetProgress';

type Variables = { [key: string]: string };

export default function SystemNotificationTemplateEditor({
    type,
    fund,
    errors,
    compose = false,
    onChange,
    template,
    notification,
    organization,
    onEditUpdated,
    implementation,
    variableValues,
}: {
    type: string;
    fund?: Partial<Fund>;
    errors?: ResponseErrorData;
    compose?: boolean;
    onChange: (notification: SystemNotification) => void;
    template: NotificationTemplate;
    organization: Organization;
    notification: SystemNotification;
    implementation: Implementation;
    onEditUpdated?: (editing: boolean) => void;
    variableValues?: Variables;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const implementationNotificationsService = useImplementationNotificationService();

    const [edit, setEdit] = useState(false);
    const [enable, setEnable] = useState(notification['enable_' + type]);
    const [formErrors, setFormErrors] = useState(errors);
    const [markdownRaw, setMarkdownRaw] = useState(null);
    const [titlePreview, setTitlePreview] = useState(null);
    const [contentPreview, setContentPreview] = useState(null);
    const insertMarkdownTextRef = useRef<(text: string) => void>(null);

    const [header] = useState({
        icon: translate(`system_notifications.types.${type}.icon`),
        title: translate(`system_notifications.types.${type}.title`),
    });

    const [disabledNotes] = useState({
        enable: `${header.title} staat nu aan.`,
        disabled: `${header.title} staat nu uit.`,
    });

    const [variables] = useState(() => {
        return notification.variables.map((variable) => ({
            id: variable,
            key: variablesMap[`:${variable}`],
            label: variablesMapLabels[variablesMap[`:${variable}`]],
            types: implementationNotificationsService.isMailOnlyVariable(`:${variable}`)
                ? ['mail']
                : ['mail', 'push', 'database'],
        }));
    });

    const titleId = useMemo(() => uniqueId('template_title_'), []);
    const descriptionId = useMemo(() => uniqueId('template_description_'), []);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

    const insertAtCursor = useCallback((inputEl: HTMLTextAreaElement | HTMLInputElement, str: string) => {
        return new Promise((resolve) => {
            if (inputEl.selectionStart || inputEl.selectionStart === 0) {
                const value = inputEl.value;
                const start = inputEl.selectionStart;
                const end = inputEl.selectionEnd;

                inputEl.value = value.substring(0, start) + str + value.substring(end, value.length);
                inputEl.selectionStart = start + str.length;
                inputEl.selectionEnd = start + str.length;
            } else {
                // Not supported
                inputEl.value += str;
            }

            inputEl.focus();
            resolve(true);
        });
    }, []);

    const form = useFormBuilder<{
        formal?: boolean;
        title?: string;
        content?: string;
        content_html?: string;
    }>(null, (values) => {
        let data: object;

        if (compose) {
            const { formal, title, content, content_html } = values;
            const templates = [{ title, content: content.replace(/\\/g, ''), content_html, formal, type }];
            data = { templates };
        } else {
            const { formal, title, content, content_html = '' } = values;

            const newTemplate = {
                title: implementationNotificationsService.labelsToVars(title),
                content: implementationNotificationsService.labelsToVars(content),
                content_html: content_html ? implementationNotificationsService.labelsToVars(content_html) : null,
                ...{ formal, type: type, fund_id: fund?.id },
            };

            const defaultTemplate = notification.templates_default.filter((item) => item.type == type)[0] || null;
            const isSameTitle = newTemplate.title === defaultTemplate.title;
            const isSameContent = newTemplate.content === defaultTemplate.content;

            const shouldReset = isSameTitle && isSameContent;
            data = {
                ...(shouldReset ? { templates_remove: [{ formal, type: type }] } : { templates: [newTemplate] }),
            };
        }

        updateTemplate(data);
    });

    const { update: formUpdate } = form;

    const editTemplate = useCallback(() => {
        const { formal, title, content, content_html } = template;
        const data = { formal, title, content, content_html };

        formUpdate(data);
        setEdit(true);
        onEditUpdated?.(true);
    }, [onEditUpdated, template, formUpdate]);

    const cancelTemplateEdit = useCallback(() => {
        setEdit(false);
        onEditUpdated?.(false);
    }, [onEditUpdated]);

    const updateTemplate = useCallback(
        (data) => {
            if (compose) {
                const templates = data?.templates.map((item: NotificationTemplate) => {
                    return { ...item, ...(item.type === 'mail' ? markdownRaw : {}) };
                });

                form.setIsLocked(false);
                onChange({ ...data, ...(templates ? { templates } : {}) });
                cancelTemplateEdit();

                return;
            }

            setProgress(0);

            implementationNotificationsService
                .update(organization.id, implementation.id, notification.id, data)
                .then((res) => {
                    setFormErrors(null);
                    onChange(res.data.data);
                    cancelTemplateEdit();
                    pushSuccess('Opgeslagen', `${header.title} sjabloon opgeslagen.`);
                })
                .catch((res: ResponseError) => {
                    if (res.status === 422) {
                        setFormErrors({
                            subject: res.data?.errors['templates.0.title'],
                            content: res.data?.errors['templates.0.content'],
                        });
                    }

                    pushDanger('Fout!', 'Er is iets fout gegaan.');
                })
                .finally(() => {
                    form.setIsLocked(false);
                    setProgress(100);
                });
        },
        [
            form,
            compose,
            onChange,
            pushDanger,
            pushSuccess,
            setProgress,
            markdownRaw,
            header.title,
            organization.id,
            notification.id,
            implementation.id,
            cancelTemplateEdit,
            implementationNotificationsService,
        ],
    );

    const addVariable = useCallback(
        (fieldType: 'title' | 'content', variable: { key: string }) => {
            const input = fieldType === 'title' ? titleInputRef.current : descriptionInputRef.current;

            // markdown editor
            if (fieldType == 'content' && type == 'mail') {
                insertMarkdownTextRef.current?.(variable.key);
            } else {
                insertAtCursor(input, variable.key).then(() => formUpdate({ [fieldType]: input.value }));
            }
        },
        [insertAtCursor, type, formUpdate],
    );

    const resetToDefault = useCallback(() => {
        openModal((modal) => (
            <ModalDangerZone
                modal={modal}
                title="Opnieuw instellen"
                description={[
                    'Door het bericht opnieuw in te stellen wordt uw bericht hersteld naar de oorsponkelijke template.',
                    'Deze actie is niet ongedaan te maken.',
                ].join(' ')}
                buttonCancel={{
                    text: 'Annuleren',
                    onClick: () => modal.close(),
                }}
                buttonSubmit={{
                    text: 'Bevestigen',
                    onClick: () => {
                        modal.close();

                        updateTemplate(
                            compose
                                ? {
                                      ...notification,
                                      templates: notification.templates.filter((item) => item.type != type),
                                      templates_default: notification.templates_default.map((item) => ({
                                          ...item,
                                      })),
                                  }
                                : {
                                      templates_remove: [{ formal: template.formal, type: type, fund_id: fund?.id }],
                                  },
                        );

                        cancelTemplateEdit();
                    },
                }}
            />
        ));
    }, [cancelTemplateEdit, compose, fund?.id, notification, openModal, template.formal, type, updateTemplate]);

    const [editorButtons] = useState([
        {
            key: 'mailPreview',
            icon: 'mdi mdi-eye-outline',
            iconKey: 'mail',
            handler: ($editor: { summernote: (config: string) => string }) => {
                openModal((modal) => (
                    <ModalMailPreview
                        modal={modal}
                        title={titleInputRef?.current?.value}
                        content_html={implementationNotificationsService.labelsToBlocks(
                            $editor.summernote('code'),
                            implementation,
                        )}
                    />
                ));
            },
        },
    ]);

    const toggleSwitched = useCallback(
        (enable) => {
            const data = { ['enable_' + type]: enable };

            implementationNotificationsService
                .update(organization.id, implementation.id, notification.id, data)
                .then((res) => {
                    onChange(res.data.data);
                    pushSuccess('Opgeslagen', `${header.title} is nu ${enable ? 'ingeschakeld.' : 'uitgeschakeld.'}`);
                });
        },
        [
            type,
            onChange,
            pushSuccess,
            notification,
            header.title,
            organization.id,
            implementation.id,
            implementationNotificationsService,
        ],
    );

    const updateTemplatePreview = useCallback(
        (template: NotificationTemplate) => {
            setTitlePreview(implementationNotificationsService.contentToPreview(template?.title || '', variableValues));

            if (template.type === 'mail') {
                setContentPreview(
                    implementationNotificationsService.labelsToBlocks(
                        implementationNotificationsService.contentToPreview(
                            template?.content_html || '',
                            variableValues,
                        ),
                        implementation,
                    ),
                );
            }
        },
        [implementation, implementationNotificationsService, variableValues],
    );

    useEffect(() => {
        updateTemplatePreview(template);
    }, [template, updateTemplatePreview, variableValues]);

    if (!template) {
        return <LoadingCard />;
    }

    return (
        <div className="card card-collapsed">
            {compose ? (
                <div className="card-header">
                    <div className="flex flex-row">
                        <div className="flex flex-pad flex-grow">
                            <div className="card-title">
                                <em className={`mdi mdi-${header.icon}`} />
                                <span>{header.title}</span>
                            </div>
                        </div>
                        <div className="flex flex-pad flex-end">
                            {edit ? (
                                <button
                                    className="button button-default button-sm button-flat"
                                    type="button"
                                    onClick={() => cancelTemplateEdit()}>
                                    <em className="mdi mdi-close icon-start" />
                                    Annuleren
                                </button>
                            ) : (
                                <button
                                    className="button button-primary button-sm button-flat"
                                    type="button"
                                    onClick={() => editTemplate()}>
                                    <em className="mdi mdi-pencil icon-start" />
                                    Wijzig de inhoud van de e-mail
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`card-header ${enable && notification.enable_all ? '' : 'card-header-danger'}`}>
                    <div className="flex flex-row">
                        <div className="flex flex-pad flex-grow">
                            <div className="card-title">
                                <em className={`mdi mdi-${header.icon}`} />
                                <span>{header.title}</span>
                                &nbsp;
                                {fund && <span>({fund.name})</span>}
                            </div>
                        </div>

                        {notification.editable && !edit && (
                            <div className="flex flex-pad flex-vertical flex-center">
                                <ToggleControl
                                    id={'enable_' + type}
                                    className={`form-toggle-danger ${notification.enable_all ? '' : 'form-toggle-off'}`}
                                    title={!notification.enable_all || !enable ? disabledNotes.disabled : ''}
                                    checked={enable}
                                    disabled={!notification.enable_all}
                                    labelRight={false}
                                    onChange={() => {
                                        if (notification.enable_all) {
                                            setEnable(!enable);
                                            toggleSwitched(!enable);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {edit && (
                            <div className="flex flex-pad flex-end">
                                <button
                                    className="button button-danger button-sm button-flat"
                                    onClick={() => resetToDefault()}>
                                    <em className="mdi mdi-refresh icon-start" />
                                    Opnieuw instellen
                                </button>
                                <button
                                    className="button button-default button-sm button-flat"
                                    type="button"
                                    onClick={() => cancelTemplateEdit()}>
                                    <em className="mdi mdi-close icon-start" />
                                    Annuleren
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div
                className={`card-section ${
                    (enable && notification.enable_all) || compose ? '' : 'card-section-danger'
                }`}>
                <form onSubmit={form.submit}>
                    {!compose && notification.editable && !edit && (
                        <div className="card-section-actions">
                            <button
                                className="button button-primary button-sm button-flat"
                                type="button"
                                onClick={() => editTemplate()}>
                                <em className="mdi mdi-pencil-outline icon-start" />
                                Bewerken
                            </button>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label form-label-required" htmlFor={titleId}>
                            Onderwerp
                        </label>

                        {edit ? (
                            <div>
                                <div className="editor-variables">
                                    <div className="variables-list">
                                        {variables.map(
                                            (variable, index) =>
                                                variable.types.includes('push') && (
                                                    <button
                                                        key={index}
                                                        className="button button-primary button-flat button-xs"
                                                        type="button"
                                                        onClick={() => addVariable('title', variable)}>
                                                        {variable.label}
                                                    </button>
                                                ),
                                        )}
                                    </div>

                                    <input
                                        className="form-control"
                                        id={titleId}
                                        value={form.values.title}
                                        maxLength={type == 'push' ? 40 : 160}
                                        onChange={(e) => form.update({ title: e.target.value })}
                                        ref={titleInputRef}
                                    />
                                    <FormError error={formErrors?.subject} />

                                    <div className="form-hint">
                                        {translate('system_notifications.hints.maxlen', {
                                            attribute: 'onderwerp',
                                            size: type == 'push' ? 40 : 140,
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card-title">
                                <div className="flex-vertical">
                                    <span>{titlePreview || 'Geen onderwerp'}</span>
                                    <FormError error={formErrors?.subject} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label form-label form-label-required" htmlFor={descriptionId}>
                            {edit ? 'Bericht' : 'Voorbeeld'}
                        </label>

                        {type != 'mail' ? (
                            <div>
                                <div className={edit ? 'editor-variables' : ''}>
                                    {!edit && type === 'push' && (
                                        <div className="card-text">{template.content || 'Geen bericht'}</div>
                                    )}

                                    {!edit &&
                                        type === 'database' &&
                                        (template.content || 'Geen bericht').split('\n').map((description, index) => (
                                            <div key={index} className="card-text">
                                                {description}
                                            </div>
                                        ))}

                                    {edit && (
                                        <Fragment>
                                            <div className="variables-list">
                                                {variables.map(
                                                    (variable, index) =>
                                                        variable.types.includes(type) && (
                                                            <button
                                                                key={index}
                                                                className="button button-primary button-flat button-xs"
                                                                type="button"
                                                                onClick={() => addVariable('content', variable)}>
                                                                {variable.label}
                                                            </button>
                                                        ),
                                                )}
                                            </div>

                                            <textarea
                                                className="form-control"
                                                id={descriptionId}
                                                maxLength={type == 'push' ? 170 : 400}
                                                rows={type == 'push' ? 2 : 4}
                                                value={form.values.content || ''}
                                                onChange={(e) => form.update({ content: e.target.value })}
                                                ref={descriptionInputRef}
                                            />

                                            <FormError error={formErrors?.content} />

                                            <div className="form-hint">
                                                {translate('system_notifications.hints.maxlen', {
                                                    attribute: 'bericht',
                                                    size: type == 'push' ? 170 : 400,
                                                })}
                                            </div>
                                        </Fragment>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                {edit ? (
                                    <div className="editor-variables">
                                        <div className="variables-list">
                                            {variables.map(
                                                (variable, index) =>
                                                    variable.types.includes(type) && (
                                                        <button
                                                            key={index}
                                                            className="button button-primary button-flat button-xs"
                                                            type="button"
                                                            onClick={() => addVariable('content', variable)}>
                                                            {variable.label}
                                                        </button>
                                                    ),
                                            )}
                                        </div>

                                        <MarkdownEditor
                                            value={form.values.content_html || ''}
                                            onChange={(content) => form.update({ content })}
                                            onUpdatedRaw={(data) => {
                                                setMarkdownRaw({ content_html: data.data.content_html });
                                            }}
                                            allowLists={false}
                                            allowPreview={!compose}
                                            buttons={editorButtons}
                                            insertTextRef={insertMarkdownTextRef}
                                        />

                                        <FormError error={formErrors?.content} />

                                        <div className="form-hint">
                                            {translate('system_notifications.hints.maxlen', {
                                                attribute: 'bericht',
                                                size: 16384,
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <Fragment>
                                        <div className="block block-mail_preview">
                                            <div className="mail_preview-wrapper">
                                                <div className="mail_preview-inner">
                                                    <div className="mail_preview-body">
                                                        <div
                                                            className="block block-markdown block-markdown-center"
                                                            dangerouslySetInnerHTML={{ __html: contentPreview }}
                                                        />
                                                        <div className="mail_preview-footer" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <FormError error={formErrors?.content} />
                                    </Fragment>
                                )}
                            </div>
                        )}
                    </div>

                    {edit && (
                        <div className="form-group">
                            <div className="button-group flex-center">
                                <button
                                    className="button button-default"
                                    type="button"
                                    onClick={() => cancelTemplateEdit()}>
                                    Annuleren
                                </button>
                                <button className="button button-primary" type="submit">
                                    Opslaan
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
