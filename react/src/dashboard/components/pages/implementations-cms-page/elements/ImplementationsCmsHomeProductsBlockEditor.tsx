import React, { useCallback, useEffect, useState } from 'react';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import useImplementationPageService from '../../../../services/ImplementationPageService';
import Implementation from '../../../../props/models/Implementation';
import Organization from '../../../../props/models/Organization';
import useSetProgress from '../../../../hooks/useSetProgress';
import FormError from '../../../elements/forms/errors/FormError';
import usePushApiError from '../../../../hooks/usePushApiError';

export default function ImplementationsCmsHomeProductsBlockEditor({
    pageBlock,
    setPageBlock,
    implementation,
    activeOrganization,
    saveBlockRef,
}: {
    pageBlock?: ImplementationPage;
    setPageBlock?: React.Dispatch<React.SetStateAction<ImplementationPage>>;
    saveBlockRef: React.MutableRefObject<() => Promise<boolean>>;
    implementation: Implementation;
    activeOrganization: Organization;
}) {
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const implementationPageService = useImplementationPageService();

    const [errors, setErrors] = useState<{ [key: string]: Array<string> }>({});

    const submitData = useCallback(async () => {
        const data = {
            state: 'public',
            external: false,
            page_type: 'block_home_products',
            title: pageBlock.title,
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
        <div className={'col col-lg-9'}>
            <div className="card-heading">Aanbod sectie</div>
            <div className="form-group form-group-inline form-group-inline-xl">
                <label className="form-label">Sectietitel</label>
                <div className="form-offset">
                    <input
                        className={'form-control'}
                        value={pageBlock?.title}
                        placeholder={'Sectietitel'}
                        onChange={(e) => setPageBlock({ ...pageBlock, title: e.target.value })}
                    />
                </div>
                <FormError error={errors?.title} />
            </div>
            <div className="form-group form-group-inline form-group-inline-xl">
                <label className="form-label">Paragraaf</label>
                <div className="form-offset">
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
                    <FormError error={errors?.description} />
                </div>
            </div>
        </div>
    );
}
