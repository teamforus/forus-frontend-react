import React, { useCallback, useEffect, useRef, useState } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useMarkdownService } from '../../../../services/MarkdownService';
import ModalMarkdownCustomLink from '../../../modals/ModalMarkdownCustomLink';

type SummernoteConstructor = (
    config:
        | string
        | ({ [key: string]: string | number | boolean | object } & {
              callbacks: { onChange: CallableFunction; onPaste: CallableFunction };
          }),
    config2?: string,
) => void;

type SummernoteObject = {
    ui: {
        button: (value: object) => { render: CallableFunction };
        dropdown: (value: { items: Array<string>; callback: (items: Array<HTMLElement>) => void }) => null;
        buttonGroup: (buttons: Array<object>) => { render: CallableFunction };
    };
};

type Summernote = SummernoteConstructor & SummernoteObject;

const $ =
    typeof jQuery !== 'undefined'
        ? (jQuery as JQueryStatic & {
              summernote: Summernote;
          })
        : null;

export default function MarkdownEditor({
    value = '',
    buttons,
    placeholder = null,
    alignment = null,
    onChangeAlignment = null,
    onMediaUploaded = null,
    disabled = false,
    allowLists = true,
    allowPreview = false,
    allowAlignment = false,
    extendedOptions = false,
    bindEditor = null,
    onChange = null,
    onUpdatedRaw,
    insertTextRef,
}: {
    value: string;
    bindEditor?: CallableFunction;
    modal?: string;
    buttons?: Array<{ key: string; handler: CallableFunction; iconKey: string; icon: string }>;
    alignment?: string;
    onChangeAlignment?: (alignment: string) => void;
    onUpdatedRaw?: (data: { data: { content?: string; content_html?: string } }) => void;
    disabled?: boolean;
    placeholder?: string;
    allowLists?: boolean;
    allowPreview?: boolean;
    allowAlignment?: boolean;
    extendedOptions?: boolean;
    onChange: (value: string) => void;
    onMediaUploaded?: (value: { media_uid: string }) => void;
    insertTextRef?: React.MutableRefObject<(text: string) => void>;
}) {
    const $element = useRef<HTMLDivElement>(null);
    const $theEditor = useRef<HTMLTextAreaElement>(null);
    const codeArea = useRef(null);
    const [initialized, setInitialized] = useState(false);
    const [blockAlignment, setBlockAlignment] = useState(alignment);

    const openModal = useOpenModal();
    const markdownService = useMarkdownService();
    const markdownValueRef = useRef(null);

    const onChangeRef = useRef(null);
    const mediaUploadedRef = useRef(null);

    const getEditor = useCallback(() => {
        return $($theEditor.current) as unknown as { summernote: Summernote };
    }, []);

    const find = useCallback((selector: string) => {
        return $($element.current).find(selector);
    }, []);

    const clear = useCallback(() => {
        getEditor().summernote('reset');
    }, [getEditor]);

    const replace = useCallback(
        (value: string) => {
            getEditor().summernote('code', value);
        },
        [getEditor],
    );

    const insertHTML = useCallback(
        (value: string) => {
            getEditor().summernote('pasteHTML', value);
        },
        [getEditor],
    );

    const insertText = useCallback(
        (value: string) => {
            getEditor().summernote('editor.insertText', value);
        },
        [getEditor],
    );

    const getEditingArea = useCallback(() => {
        return find('.note-editing-area');
    }, [find]);

    const getCustomLink = useCallback(
        (
            type: 'imageLink' | 'customLink' | 'youtubeLink',
            values: { text: string; url: string },
        ): Promise<object | null> => {
            return new Promise((resolve) => {
                let response = null;

                openModal(
                    (modal) => (
                        <ModalMarkdownCustomLink
                            modal={modal}
                            type={type}
                            values={values}
                            success={(data) => {
                                const { url, text, uid, alt } = data;

                                if (uid && typeof mediaUploadedRef.current == 'function') {
                                    mediaUploadedRef.current({ media_uid: uid });
                                }

                                response = { ...values, ...{ url, text, alt } };
                            }}
                        />
                    ),
                    {
                        onClosed: () => response && resolve(response),
                    },
                );
            });
        },
        [openModal],
    );

    const AlignButton = useCallback(
        (icon = 'left') => {
            return function () {
                const ui = $.summernote.ui;
                const btnIcon = `mdi mdi-align-horizontal-${icon}`;

                const makeLabelItem = (text: string, action: string, icon = null): string => {
                    const inner = [
                        icon ? `<em class="mdi mdi-${icon}"></em>` : '',
                        `<span class="note-dropdown-label">${text}</span>`,
                    ].join('');

                    return `<div data-action="${action}">${inner}</div>`;
                };

                const event = ui.buttonGroup([
                    ui.button({
                        contents: `<em class="${btnIcon}"/></em>`,
                        data: { toggle: 'dropdown' },
                    }),
                    ui.dropdown({
                        items: [
                            makeLabelItem('Tekst links uitlijnen', 'left', 'align-horizontal-left'),
                            makeLabelItem('Tekst in het midden uitlijnen', 'center', 'align-horizontal-center'),
                            makeLabelItem('Tekst rechts uitlijnen', 'right', 'align-horizontal-right'),
                        ],
                        callback: function (items: Array<HTMLElement>) {
                            $(items)
                                .find('.note-dropdown-item [data-action]')
                                .on('click', function (e) {
                                    const option = $(this);
                                    const parent = $(items[0]).parent();
                                    const dropdownBtn = parent.find('.note-btn');
                                    const dropdownBtnIcon = dropdownBtn.find('.mdi');
                                    const direction = option.data('action');

                                    dropdownBtnIcon.attr('class', option.find('.mdi').attr('class'));

                                    window.setTimeout(() => {
                                        setBlockAlignment(direction);
                                        onChangeAlignment?.(direction);
                                    }, 0);
                                    e.preventDefault();
                                });
                        },
                    }),
                ]);

                // return button as jquery object
                return event.render();
            };
        },
        [onChangeAlignment],
    );

    const CmsButton = useCallback(
        (type: 'mailPreview' | 'imageLink' | 'customLink' | 'youtubeLink' = 'customLink', icon = 'link') => {
            return function (context: { options: { icons: { [key: string]: string } }; invoke: CallableFunction }) {
                const ui = $.summernote.ui;
                const btnIcon = context.options.icons[icon];

                const showLinkDialog = function (
                    type: 'imageLink' | 'customLink' | 'youtubeLink',
                    linkInfo: { text?: string; url?: string },
                ): Promise<{ alt?: string; url?: string }> {
                    return new Promise((resolve) => {
                        const { text, url } = linkInfo;

                        getCustomLink(type, { text, url }).then((linkInfoResp) => {
                            resolve({ ...linkInfo, ...linkInfoResp });
                        });
                    });
                };

                // create button
                const button = ui.button({
                    contents: `<em class="${btnIcon}"/></em>`,
                    // tooltip: 'hello',
                    click: function () {
                        const _buttons = buttons || [];

                        context.invoke('editor.saveRange');
                        _buttons.forEach((button) => (button.key == type ? button.handler(getEditor(), button) : null));

                        if (type === 'customLink') {
                            const linkInfo = context.invoke('editor.getLinkInfo');
                            const { url, text } = linkInfo;

                            showLinkDialog(type, { url, text }).then(
                                (data) => {
                                    context.invoke('editor.restoreRange');
                                    context.invoke('editor.createLink', { ...linkInfo, ...data });
                                },
                                () => context.invoke('editor.restoreRange'),
                            );
                        }

                        if (type === 'imageLink' || type === 'youtubeLink') {
                            showLinkDialog(type, {}).then(
                                (data) => {
                                    const { alt, url } = data;

                                    context.invoke('editor.restoreRange');

                                    if (type === 'imageLink') {
                                        context.invoke('editor.insertImage', url || '', (img: JQuery) =>
                                            img.attr('alt', alt || ''),
                                        );
                                    }

                                    if (type === 'youtubeLink') {
                                        const ytUrl = url
                                            .replace('https://youtu.be/', 'https://www.youtube.com/embed/')
                                            .replace(
                                                'https://www.youtube.com/watch?v=',
                                                'https://www.youtube.com/embed/',
                                            )
                                            .split('&')[0];

                                        const template =
                                            `<div class="youtube-root">` +
                                            `<iframe src="${ytUrl}" allowfullscreen style="border: none"></iframe>` +
                                            `</div>`;

                                        context.invoke('editor.insertNode', $(template)[0]);
                                    }
                                },
                                () => context.invoke('editor.restoreRange'),
                            );
                        }
                    },
                });

                return button.render(); // return button as jquery object
            };
        },
        [buttons, getCustomLink, getEditor],
    );

    const CmsCodeMarkdown = useCallback(() => {
        const timer = {
            timeout: null,
            interval: 500,
        };

        return function () {
            const ui = $.summernote.ui;
            const btnIcon = `mdi mdi-code-braces`;

            // create button
            const button = ui.button({
                contents: `<em class="${btnIcon}"/></em>`,
                // tooltip: 'hello',
                click: function () {
                    if (!codeArea.current) {
                        codeArea.current = document.createElement('textarea');
                        codeArea.current.classList.add('note-editing-code');
                        codeArea.current.value = markdownValueRef?.current || '';

                        getEditingArea().append(codeArea.current);
                        find('.note-btn-group:not(.note-code) .note-btn').addClass('disabled');

                        codeArea.current.oninput = () => {
                            clearTimeout(timer.timeout);

                            timer.timeout = setTimeout(
                                () =>
                                    markdownService.toHtml(codeArea.current.value).then((res) => {
                                        replace(res.data.html);
                                    }),
                                timer.interval,
                            );
                        };
                    } else {
                        clearTimeout(timer.timeout);
                        getEditor().summernote('disable');

                        markdownService.toHtml(codeArea.current.value).then((res) => {
                            replace(res.data.html);
                            codeArea.current.remove();
                            codeArea.current = null;
                            getEditor().summernote('enable');
                        });
                    }
                },
            });

            return button.render(); // return button as jquery object
        };
    }, [find, getEditingArea, getEditor, markdownService, replace]);

    const buildToolbarsList = useCallback(
        (buttons: Array<{ key: string }>) => {
            const toolbars = [];

            toolbars.push(['style', ['style']]);
            toolbars.push(allowAlignment ? ['align', ['cmsBlockAlign']] : null);
            toolbars.push(['font', ['bold', 'italic', 'clear']]);
            toolbars.push(allowLists ? ['para', ['ol', 'ul']] : null);
            toolbars.push(extendedOptions ? ['table', ['table']] : null);
            toolbars.push(['cms', ['cmsLink', 'unlink', ...(extendedOptions ? ['cmsMedia', 'cmsLinkYoutube'] : [])]]);
            toolbars.push(['code', localStorage.markdownCode == 'true' ? ['cmsCodeMarkdown'] : '']);
            toolbars.push(['view', ['fullscreen', ...(allowPreview ? ['cmsMailView'] : [])]]);

            if (buttons?.length) {
                toolbars.push(['buttons', buttons.map((button) => button.key)]);
            }

            return toolbars.filter((group) => group);
        },
        [allowAlignment, allowLists, allowPreview, extendedOptions],
    );

    const initTheEditor = useCallback(() => {
        const _buttons = buttons || [];
        const icons = _buttons.reduce(
            (icons, btn) => ({
                ...icons,
                [btn.iconKey || btn.key]: btn.icon,
            }),
            {},
        );

        if (initialized) {
            return;
        }

        // $_theEditor.summernote('reset');
        getEditor().summernote({
            placeholder: placeholder || '',
            tabsize: 4,
            height: 400,
            disableDragAndDrop: true,
            disableResizeImage: true,
            icons: {
                bold: 'mdi mdi-format-bold',
                italic: 'mdi mdi-format-italic',
                underline: 'mdi mdi-format-underline',
                eraser: 'mdi mdi-format-clear',

                caret: 'mdi mdi-menu-down',
                magic: 'mdi mdi-format-size',

                unorderedlist: 'mdi mdi-format-list-bulleted',
                orderedlist: 'mdi mdi-format-list-numbered',

                table: 'mdi mdi-table',
                close: 'mdi mdi-close',
                arrowsAlt: 'mdi mdi-fullscreen',

                link: 'mdi mdi-link',
                unlink: 'mdi mdi-link-off',
                picture: 'mdi mdi-image',
                video: 'mdi mdi-youtube',
                view: 'mdi mdi-eye-outline',

                rowBelow: 'mdi mdi-table-row-plus-after',
                rowAbove: 'mdi mdi-table-row-plus-before',

                colBefore: 'mdi mdi-table-column-plus-before',
                colAfter: 'mdi mdi-table-column-plus-after',

                rowRemove: 'mdi mdi-table-row-remove',
                colRemove: 'mdi mdi-table-column-remove',
                trash: 'mdi mdi-delete-outline',

                ...icons,
            },

            styleTags: ['h1', 'h2', 'h3', 'h4', 'p'],
            toolbar: buildToolbarsList(buttons),
            buttons: {
                cmsLink: CmsButton('customLink', 'link'),
                cmsMedia: CmsButton('imageLink', 'picture'),
                cmsLinkYoutube: CmsButton('youtubeLink', 'video'),
                cmsMailView: CmsButton('mailPreview', 'view'),
                cmsBlockAlign: AlignButton(),
                cmsCodeMarkdown: CmsCodeMarkdown(),
            },
            callbacks: {
                onChange: (content_html: string) => {
                    const value = markdownService.toMarkdown(content_html);

                    onChangeRef.current(value);
                    markdownValueRef.current = value;
                    onUpdatedRaw?.({ data: { content: value, content_html } });
                },
                onPaste: (e: Event & { originalEvent: ClipboardEvent }) => {
                    e.preventDefault();
                    document.execCommand('insertText', false, e?.originalEvent.clipboardData.getData('text') || '');
                },
            },
        });

        getEditor().summernote('removeModule', 'linkPopover');
        getEditor().summernote('removeModule', 'imagePopover');
        getEditor().summernote('removeModule', 'autoLink');
        setInitialized(true);
    }, [
        AlignButton,
        buildToolbarsList,
        buttons,
        markdownService,
        placeholder,
        CmsButton,
        CmsCodeMarkdown,
        initialized,
        getEditor,
        onUpdatedRaw,
    ]);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        mediaUploadedRef.current = onMediaUploaded;
    }, [onMediaUploaded]);

    useEffect(() => {
        initTheEditor();

        if (disabled) {
            getEditor().summernote('disable');
        }

        if (typeof bindEditor == 'function') {
            bindEditor({ editor: { editor: $theEditor, clear, replace, insertText, insertHTML } });
        }
    }, [bindEditor, clear, disabled, getEditor, initTheEditor, insertHTML, insertText, replace]);

    useEffect(() => {
        getEditor().summernote('code', value);
    }, [value, getEditor]);

    useEffect(() => {
        if (insertTextRef) {
            insertTextRef.current = insertText;
        }
    }, [insertText, insertTextRef]);

    return (
        <div
            className={`block block-markdownable ${allowAlignment ? `block-markdownable-${blockAlignment}` : ''}`}
            ref={$element}>
            <textarea className="markdown-editor block block-markdown" ref={$theEditor} />
        </div>
    );
}
