import React, { Fragment, useCallback, useEffect, useState } from 'react';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import Implementation from '../../../../props/models/Implementation';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../elements/select-control/SelectControl';

export default function ImplementationsInlineBlockEditor({
    blockKey,
    pageBlock,
    setPageBlock,
    implementation,
    activeOrganization,
    saveBlockRef,
    state = false,
    markdown = true,
}: {
    blockKey: string;
    pageBlock?: ImplementationPage;
    setPageBlock?: React.Dispatch<React.SetStateAction<ImplementationPage>>;
    saveBlockRef: React.MutableRefObject<() => Promise<boolean>>;
    implementation: Implementation;
    activeOrganization: Organization;
    state?: boolean;
    markdown?: boolean;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const implementationPageService = useImplementationPageService();

    const [errors, setErrors] = useState<{ [key: string]: Array<string> }>({});

    const [states] = useState([
        { value: 'draft', name: 'Draft' },
        { value: 'public', name: 'Public' },
    ]);

    const submitData = useCallback(async () => {
        const data = {
            external: false,
            page_type: blockKey,
            title: pageBlock.title,
            state: state ? pageBlock.state : 'public',
            description: pageBlock.description,
            description_alignment: pageBlock.description_alignment,
        };

        return await new Promise<boolean>((resolve) => {
            const promise: Promise<ApiResponseSingle<ImplementationPage>> = pageBlock?.id
                ? implementationPageService.update(activeOrganization.id, implementation.id, pageBlock.id, data)
                : implementationPageService.store(activeOrganization.id, implementation.id, data);

            setErrors(null);

            promise
                .then((res) => {
                    resolve(true);
                    setPageBlock((pageBlock) => ({ ...pageBlock, ...res.data }));
                })
                .catch((err: ResponseError) => {
                    resolve(false);
                    setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        });
    }, [
        state,
        blockKey,
        activeOrganization.id,
        implementation.id,
        implementationPageService,
        pageBlock,
        pushApiError,
        setPageBlock,
        setProgress,
    ]);

    useEffect(() => {
        saveBlockRef.current = submitData;
    }, [saveBlockRef, submitData]);

    return (
        <Fragment>
            {state && (
                <FormGroup
                    label="Status"
                    error={errors?.state}
                    input={(id) => (
                        <SelectControl
                            id={id}
                            className="form-control"
                            propKey={'value'}
                            value={pageBlock?.state}
                            onChange={(state: string) => setPageBlock({ ...pageBlock, state })}
                            options={states}
                        />
                    )}
                />
            )}

            <FormGroup
                label="Sectietitel"
                error={errors?.title}
                input={(id) => (
                    <input
                        id={id}
                        className={'form-control'}
                        value={pageBlock?.title}
                        placeholder={'Sectietitel'}
                        onChange={(e) => setPageBlock({ ...pageBlock, title: e.target.value })}
                    />
                )}
            />

            <FormGroup
                label="Paragraaf"
                error={errors?.description}
                input={(id) =>
                    markdown ? (
                        <MarkdownEditor
                            placeholder={'Paragraaf'}
                            alignment={pageBlock?.description_alignment}
                            onChangeAlignment={(description_alignment: 'left' | 'center' | 'right') => {
                                setPageBlock((pageBlock) => ({ ...pageBlock, description_alignment }));
                            }}
                            extendedOptions={true}
                            allowAlignment={true}
                            value={pageBlock?.description_html}
                            onChange={(description) => setPageBlock({ ...pageBlock, description })}
                        />
                    ) : (
                        <textarea
                            id={id}
                            placeholder={'Paragraaf'}
                            className={'form-control'}
                            value={pageBlock?.description}
                            onChange={(e) => setPageBlock({ ...pageBlock, description: e.target.value })}
                        />
                    )
                }
            />
        </Fragment>
    );
}
